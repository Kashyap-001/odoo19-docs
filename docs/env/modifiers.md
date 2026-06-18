# Environment Modifiers

In Odoo, every recordset carries an `env` (Environment) that defines the current user, context, and company. You can "modify" this environment to bypass security, change languages, or switch companies.

Modifiers always return a **new recordset** with the altered environment; they do not modify the original object.

---

## 1. Elevation: `sudo()` & `with_user()`

### `sudo()`
The `sudo()` method returns a new recordset that bypasses access rights (ACLs) and record rules by elevating execution to the **Superuser**.

```python
# Create an order regardless of current user's permissions
order = self.env['sale.order'].sudo().create({'partner_id': 1})
```

!!! danger "Security Warning"
    `sudo()` ignores all security. Use it only for system-level background tasks or logging where the current user shouldn't have direct access.

### `with_user(user)`
If you need to execute code as a *specific* user rather than the Superuser, use `with_user()`. This respects the target user's ACLs and Record Rules.

```python
# Run code as the designated manager
manager = self.env.ref('pways_auction.manager_user_1')
self.with_user(manager).action_approve()
```

---

## 2. Multi-Company: `with_company()`

In multi-company Odoo databases, many records and rules are tied to the active company. `with_company(company)` temporarily switches the execution context to a different company.

```python
# Fetch products specific to Company B
company_b = self.env['res.company'].browse(2)
products = self.env['product.template'].with_company(company_b).search([])
```

---

## 3. Localization & Flags: `with_context()`

The context is a dictionary of environment variables. `with_context(**kwargs)` is used to pass temporary flags or localization data to downstream methods.

### Translating Data
By changing the `lang` key, you can read or write translated values.
```python
# Get the French translation of the listing title
french_title = self.with_context(lang='fr_FR').name
```

### Common Context Flags
Odoo's ORM reacts to several special context keys:
- `active_test`: If `False`, `search()` will return archived (`active=False`) records too.
- `no_recompute`: If `True`, computed fields won't trigger automatically.
- `tracking_disable`: If `True`, changes won't generate Chatter logs.

---

## 4. Chaining Modifiers

You can chain modifiers to create highly specific execution environments.

```python
# Run as Superuser, in French, ignoring archived status
records = self.sudo().with_context(lang='fr_FR', active_test=False).search([])
```

---

## 5. Senior: High-Performance Imports

When importing thousands of records (like bulk auction bids), Odoo will try to post a log message to the Chatter for every single field change if `tracking=True` is enabled. This can crash the system.

### The `tracking_disable` Pattern
Senior architects always disable tracking during bulk imports to save massive amounts of SQL `INSERT` time.

```python
@api.model_create_multi
def import_bids(self, vals_list):
    # Disable Chatter tracking for this transaction
    env_fast = self.with_context(tracking_disable=True)
    return env_fast.create(vals_list)
```

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Modifiers (`sudo`, `with_context`, `with_company`) spawn a new recordset with altered rules.
*   **Architect Insight:** Use `with_context(tracking_disable=True)` when executing bulk scripts to bypass expensive Chatter logging.
*   **Verify Your Knowledge:** Why use `with_user()` instead of `sudo()`? (Answer: To perform an action on behalf of another user while still enforcing their specific security restrictions).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
