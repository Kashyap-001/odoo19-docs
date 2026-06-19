---
title: Odoo 19 Recordset Helpers: Changing the Environment
description: Master the Odoo 19 environment alteration helpers on recordsets. Learn when and how to use sudo(), with_context(), with_company(), with_user(), and with_env() securely.
---

# Recordset Helpers: Changing the Environment

In Odoo, recordsets are bound to an **Environment** (`self.env`). The environment is immutable: you cannot modify its properties (like changing `self.env.user` or the context) on the fly. 

To perform actions under different parameters, you must create a new recordset with an altered environment. Odoo provides a set of chainable **Recordset Helpers** to do exactly this.

```mermaid
graph TD
    Rec[Original Recordset] -->|sudo| RecS[Sudo Recordset (Bypasses rules)]
    Rec -->|with_user| RecU[User-specific Recordset]
    Rec -->|with_company| RecC[Company-specific Recordset]
    Rec -->|with_context| RecCtx[Context-altered Recordset]
    Rec -->|with_env| RecEnv[Custom Environment Recordset]
```

---

## 1. `sudo()` (Bypassing Security)

`sudo()` returns a copy of the recordset with a superuser environment. It is the most powerful helper and must be used with caution.

*   **Bypasses**: All Access Control Lists (ACLs) and Record Rules.
*   **Behavior**: Executes queries as the Superuser (`__system__` / ID 2 or UID 1).
*   **Optional Parameter**: You can pass `sudo(False)` to revert a sudoed recordset back to the user's standard permissions.

```python
# Read records that the current user doesn't have access to
secret_listings = self.env['auction.listing'].sudo().search([('state', '=', 'hidden')])

# Write to a record as superuser (e.g. logging an audit trait)
self.sudo().write({'internal_notes': 'Verified by system.'})
```

> [!WARNING]
> **Privilege Escalation Danger:** Never pass user-supplied input directly into a `write()` call on a `sudo()` recordset without strict validation. This can allow users to update fields they don't have access to (e.g. setting their own bids as won).

---

## 2. `with_context()` (Altering Context Flags)

`with_context()` returns a recordset with an updated context dictionary. You can pass positional dictionary arguments or keyword arguments.

*   **Behavior**: Overwrites or adds keys to the existing `self.env.context`.
*   **Standard Keys**: Custom flags like `active_test=False`, `lang`, `tz`, or prefill fields like `default_name`.

```python
# Pass custom flag to subsequent methods
listings_with_flag = self.with_context(skip_validation=True)
listings_with_flag.action_confirm()

# Bypass default active=True search constraint
archived_listings = self.env['auction.listing'].with_context(active_test=False).search([])
```

### Context Prefill Pattern
Odoo automatically processes context keys starting with `default_` to prefill fields in `create()` and `default_get()`.

```python
# Force-prefill partner_id on new records
new_listing = self.env['auction.listing'].with_context(default_partner_id=user.partner_id.id).create({
    'name': 'Auction Item'
})
```

---

## 3. `with_company()` (Switching Active Company)

In multi-company Odoo databases, you must run computations under the correct company context to ensure that company-dependent fields (like accounts, tax rules, or sequence numbers) are evaluated correctly.

*   **Parameter**: Takes a `res.company` recordset (or integer ID).
*   **Behavior**: Sets the active company (`self.env.company`) in the returned recordset's environment.

```python
# Evaluate pricing using company-specific rates
for listing in self:
    company_listing = listing.with_company(listing.company_id)
    listing.price = company_listing.calculate_company_price()
```

> [!IMPORTANT]
> Always use `with_company()` rather than manually updating context dictionaries (like `self.with_context(force_company=id)`) as the old context parameters are deprecated in Odoo 19.

---

## 4. `with_user()` (Impersonating a User)

`with_user()` returns a recordset with an environment bound to a specific user.

*   **Parameter**: Takes a `res.users` recordset (or integer ID).
*   **Use Cases**:
    *   Testing security rules within code (impersonating a bidder or seller).
    *   Running background processes (like crons) under a specific manager's account.

```python
# Force action execution as the Sales Manager
sales_manager = self.env.ref('pways_auction.group_auction_manager').users[0]
self.with_user(sales_manager).action_approve()
```

---

## 5. `with_env()` (Custom Environment Injection)

`with_env()` is the lowest-level helper. It allows you to completely replace the environment of a recordset with an existing `Environment` object.

*   **Parameter**: Takes an `Environment` object (`self.env`).
*   **Use Case**: Restoring a clean, un-sudoed environment or passing a customized database cursor transaction.

```python
# Revert a sudoed recordset back to the original environment
original_env = self.env
sudo_records = self.sudo()
# ... do superuser tasks ...
clean_records = sudo_records.with_env(original_env)
```

---

## 🏁 Senior Checkpoint

*   **Key Concept**: Environment helpers are **chainable** because they return a new recordset instance.
*   **Architect Insight**: Never modify self in-place; always capture the returned recordset. For example:
    *   **Incorrect**: `self.sudo(); self.write(...)` (The write still runs under standard user permissions!)
    *   **Correct**: `self.sudo().write(...)` or `records = self.sudo(); records.write(...)`
*   **Verify Your Knowledge**: What happens when you chain `self.sudo().with_user(user)`? (Answer: The `with_user` overrides the superuser environment with the specified user's permissions, effectively discarding the `sudo()`).

---

## 💻 Code Challenge

**Chain the recordset helpers to perform a lookup as the Superuser, while also disabling active records testing:**

<div class="code-challenge">
<pre><code>listings = self.env['auction.listing'].<input type="text" class="quiz-input-inline w-80" data-answer="sudo()">.<input type="text" class="quiz-input-inline w-200" data-answer="with_context(active_test=False)">.search([])
</code></pre>
<button class="quiz-check" onclick="checkCodeChallenge(this)">Check Code</button>
<div class="quiz-result"></div>
</div>
