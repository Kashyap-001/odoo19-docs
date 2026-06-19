---
title: Odoo 19 Security Modifiers (sudo, with_user, with_company)
description: Securely modify the environment in Odoo 19 using sudo(), with_user(), and with_company(). Learn when to use them and how to avoid security bypass risks.
---

# Odoo 19 Security Modifiers: Privileged Environments & Scopes

Odoo's security model (ACLs and Record Rules) is applied by default to every transaction. Sometimes, you need to alter the environment’s permission scope—this is where security modifiers come in.

---

## 1. What is it
Security modifiers are recordset methods (`sudo()`, `with_user()`, `with_company()`) that clone the active environment, changing the user context (UID) or the company scope while leaving the original recordset environment unmodified.

---

## 2. Why
Modern enterprise systems require specific actions to run with elevated privileges (e.g. letting a portal user create a partner record during signup) or under a different company context without permanently changing the active session settings.

---

## 3. When
*   Use **`sudo()`** to bypass ACL constraints and row-level Record Rules during system-internal processes.
*   Use **`with_user()`** to execute actions under another user's security permissions (e.g., scheduled crons performing actions as the admin user).
*   Use **`with_company()`** in multi-company installations to check configurations or balances belonging to the record's company rather than the user's active session company.

---

## 4. When Not
*   **Do not** use `sudo()` to fix permission errors that should be resolved by configuring proper security groups in `ir.model.access.csv` or row-level `ir.rule` parameters.
*   **Do not** pass a sudoed recordset down long call chains where user-inputted values are modified without filtering.

---

## 5. Syntax
Here is the Odoo 19 syntax for invoking environment security modifiers:

```python
# 1. Bypassing security (superuser execution UID 1)
sudo_listing = self.sudo()

# 2. Executing as a specific user
manager_user = self.env.ref('sales_team.group_sale_manager')
manager_listing = self.with_user(manager_user)

# 3. Executing within a specific company context
company_listing = self.with_company(self.company_id)
```

---

## 6. Examples

### A. Whitelisting Sudo Writes (Preventing Privilege Escalation)
```python
# ❌ Bad: Writing raw user values directly under sudo context
def update_listing_status(self, vals):
    self.sudo().write(vals)  # Malicious user can pass state='won'

# ✅ Good: Whitelisting specific fields before executing sudo write
def update_listing_status_safe(self, vals):
    safe_vals = {
        'description': vals.get('description'),
        'received_date': vals.get('received_date')
    }
    self.sudo().write(safe_vals)
```

### B. Context-aware Company Switch
```python
# Ensure the check occurs under the company matching the vehicle's record
for vehicle in self:
    vehicle.with_company(vehicle.company_id).action_verify_insurance()
```

### C. Master Project Challenge: Finished Auction Bid Access
1.  **Task**: Your `auction.listing` has a `winner_id` field. Currently, only the Admin can see winning bids.
2.  **Goal**: Use `sudo()` to allow users to see the winning bid *only* if the auction has finished, without giving them permanent access to all records.

```python
from odoo import models, fields, api
from odoo.exceptions import AccessError

class AuctionListing(models.Model):
    _name = 'auction.listing'
    _description = 'Auction Listing'

    winner_id = fields.Many2one('res.partner', string="Winner")
    state = fields.Selection([('draft', 'Draft'), ('done', 'Done')], default='draft')
    winning_bid_amount = fields.Float(compute="_compute_winning_bid")

    @api.depends('state')
    def _compute_winning_bid(self):
        for record in self:
            if record.state == 'done':
                # Sudo is used safely here because we only read the value 
                # after verifying the auction state is locked/finished.
                sudo_record = record.sudo()
                record.winning_bid_amount = sudo_record.winner_id.credit_limit
            else:
                # Standard users cannot see raw values for active auctions
                if not self.env.is_admin():
                    record.winning_bid_amount = 0.0
                else:
                    record.winning_bid_amount = record.winner_id.credit_limit
```

### 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. What does `sudo()` do?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="It bypasses all security rules and access rights, effectively acting as the Administrator/Superuser for that operation." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

---

## 7. Common Mistakes
1.  **Chaining `sudo().with_user()`**: Writing queries like `self.sudo().with_user(user)`. The user parameter overrides the superuser UID context, completely undoing the `sudo()` privilege escalation.
2.  **Bypassing Company Isolation**: Calling `.sudo()` in a multi-company database, which bypasses row-level `company_id` filters and risks leaking Company B data to Company A users.

---

## 8. Performance
*   **Query Optimization**: Sudoed queries execute faster in PostgreSQL because they do not contain the complex conditional clauses (`WHERE company_id IN (...)`) generated by active record rules.
*   **Cache Contamination Risk**: Sudoed calculations populate the environment cache with privileged values. Use `with_user()` or `with_env()` to refresh caching when returning to standard permissions.

---

## 9. Senior
In Odoo 19:
*   Minimize sudo scoping: Avoid passing sudoed objects to child helper methods. Switch to sudo context only at the precise read or write database execution point.
*   Always document the architectural safety reasoning above any `.sudo()` calls inside your code files.

---

## 10. Diagrams

This diagram contrasts the database query pipelines between a standard user environment validation and a sudoed superuser environment bypass:

```mermaid
graph LR
    subgraph "Standard User Env (UID: 102)"
        E1[self.env] -->|Checks ACL| ACL1{User has rights?}
        ACL1 -- Yes --> RR1{Record Rules: company_id = User company?}
        RR1 -- Yes --> DB1[Query DB: SELECT... WHERE company_id=1]
    end

    subgraph "Sudoed Env (UID: 1 / __system__)"
        E1 -->|self.sudo()| E2[self.env.sudo()]
        E2 -->|Bypasses ACL| DB2[Query DB: SELECT... without WHERE clauses]
    end
```

---

## 11. Related
*   [Environment Deep Dive](env_deep_dive.md)
*   [Recordset Helpers](recordset_helpers.md)
*   [Record Rules (Row-level Security)](../business/rules.md)
