---
title: Odoo 19 Security Modifiers (sudo, with_user, with_company)
description: Securely modify the environment in Odoo 19 using sudo(), with_user(), and with_company(). Learn when to use them and how to avoid security bypass risks.
---

# Odoo 19 Security Modifiers

Odoo's security model (ACLs and Record Rules) is applied by default to every operation. Sometimes, you need to "break the rules" for a specific operation—this is where security modifiers come in.

---

## 1. `self.sudo()` (Bypass Security)

`sudo()` returns a new recordset that bypasses all security rules and access rights.

```python
# Dangerous: This bypasses all record rules!
# Only use when you truly need to access data the user cannot.
listings = self.env['auction.listing'].sudo().search([])
```

**Architect Tip:** Always use `sudo()` with extreme caution. If you are reading data, consider if there is a more secure way (e.g., using a specific access group). **Never** use `sudo()` when writing data unless absolutely necessary.

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

## 4. 🏁 Senior Checkpoint
*   **Architect Insight:** `sudo()` is a global bypass. Use it only when necessary and always document *why* you are bypassing security rules.
*   **Pro Tip:** For multi-company logic, always use `with_company()` to avoid data inconsistency errors.
