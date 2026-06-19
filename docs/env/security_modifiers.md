---
title: Odoo 19 Security Modifiers (sudo, with_user, with_company)
description: Securely modify the environment in Odoo 19 using sudo(), with_user(), and with_company(). Learn when to use them and how to avoid security bypass risks.
---

# Odoo 19 Security Modifiers

Odoo's security model (ACLs and Record Rules) is applied by default to every operation. Sometimes, you need to "break the rules" for a specific operation—this is where security modifiers come in.

---

## 1. `self.sudo()` (ACL & Record Rules Bypass)

The `sudo()` helper returns a new instance of the recordset bound to a superuser environment. It is Odoo's mechanism for administrative override.

### How it Works
*   **Bypasses ACLs**: Users who normally do not have read/write/create/unlink access to a model can execute actions on it.
*   **Bypasses Record Rules**: Bypasses row-level constraints (such as `company_id` rules or user-ownership rules).
*   **Executes as System**: SQL queries are executed with the user ID `__system__` (or UID 1/admin).

```python
# Fetches all listings, completely ignoring the user's ACLs or multi-company rules
all_listings = self.env['auction.listing'].sudo().search([])
```

### ⚠️ Dangers of `sudo()`

As an architect, misuse of `sudo()` is the most common source of security vulnerabilities and bugs:

1.  **Privilege Escalation**: If you call `sudo()` on a recordset and then perform writes based on user-provided parameters (e.g. `self.sudo().write(vals)`), a malicious user can pass fields they aren't allowed to edit (like `state='won'` or `price=0.01`).
2.  **Multi-Company Data Leaks**: Because `sudo()` bypasses record rules, it also bypasses company isolation rules. If a user in Company A triggers an action that uses `sudo().search([])`, they might inadvertently read or modify confidential data belonging to Company B.
3.  **Raw SQL Injection**: Chaining `.sudo()` with raw database cursor operations (like `self.env.cr.execute(...)`) is extremely risky because raw SQL ignores Odoo ORM protections. If user input is concatenated into the SQL statement, it is executed with full database superuser privileges.

### 🛡️ Architectural Best Practices

*   **Minimize the Scope**: Do not pass a sudoed recordset down long call chains. Keep the `sudo()` call as close to the target read/write operation as possible.
    ```python
    # Bad: Passing a sudoed recordset into other business methods
    records = self.sudo()
    self._process_records(records)
    
    # Good: Sudoing only the exact write operation
    self.write({'price': new_price})
    self.sudo()._log_audit_trail()
    ```
*   **Sanitize Fields**: When writing data with `sudo()`, explicitly whitelist the fields allowed to be updated. Never pass a raw `vals` dictionary from a controller.
*   **Reset Environment**: If you have a sudoed recordset and need to perform subsequent checks under the user's real permissions, use `with_user()` or `with_env()` to return to a standard context.

---

## 2. `self.with_user()`

Sometimes you need to perform an action *as if* a different user were performing it (e.g., in automated emails or scheduled tasks).

```python
# Perform action as the Administrator
admin_user = self.env.ref('base.user_admin')
self.with_user(admin_user).action_something()
```

---

## 3. `self.with_company()`

In a multi-company environment, a record might belong to a company different from the one the user currently has active. `with_company()` forces the environment to act *as if* that company were active.

```python
# Ensure the action is performed within the context of the listing's company
for listing in self:
    listing.with_company(listing.company_id).action_check_something()
```

---

## 🏗️ Master Project Challenge: Security
1.  **Task**: Your `auction.listing` has a `winner_id` field. Currently, only the Admin can see winning bids.
2.  **Goal**: Use `sudo()` to allow users to see the winning bid *only* if the auction has finished, without giving them permanent access to all records.

---

## 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. What does sudo() do?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="It bypasses all security rules and access rights, effectively acting as the Administrator for that operation." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

---

## 4. 🏁 Senior Checkpoint
*   **Architect Insight:** `sudo()` is a global bypass. Use it only when necessary and always document *why* you are bypassing security rules.
*   **Pro Tip:** For multi-company logic, always use `with_company()` to avoid data inconsistency errors.
