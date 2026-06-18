---
title: Odoo 19 Security Modifiers (sudo, with_user, with_company)
description: Securely modify the environment in Odoo 19 using sudo(), with_user(), and with_company(). Learn when to use them and how to avoid security bypass risks.
---

# Odoo 19 Security Modifiers

Odoo's security model (ACLs and Record Rules) is applied by default to every operation. Sometimes, you need to "break the rules" for a specific operation—this is where security modifiers come in.

---

## 1. `self.sudo()` (The "SuperUser" Mode)

`sudo()` returns a new recordset that bypasses all security rules and access rights. Think of it as **logging in as the Administrator** just for this one operation.

```python
# Dangerous: This bypasses all record rules!
# Only use when you truly need to access data the user cannot.
listings = self.env['auction.listing'].sudo().search([])
```

**⚠️ Architect Tip:** Always use `sudo()` with extreme caution. If you are reading data, consider if there is a more secure way (e.g., using a specific access group). **Never** use `sudo()` when writing data unless absolutely necessary, as it can allow unauthorized users to modify sensitive records.

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
