---
title: Odoo 19 default_get() Guide: Initializing Records
description: Learn how to use default_get() in Odoo 19 to dynamically pre-fill form fields, improve user experience, and handle complex context-aware defaults.
---

# Odoo 19: Initializing Records with default_get()
... (Link to [Record Creation](create.md) for context.)

When a user clicks "Create" in the Odoo UI, they are often presented with a form that already has some fields filled in. This is handled by the **`default_get()`** method.

Understanding `default_get` is critical for providing a smooth user experience by pre-filling data based on context or user preferences.

---

## 1. What is default_get()?

`default_get()` is an ORM method that returns a dictionary of default values for a set of fields. It is called **before** the record is actually created in the database.

### The Execution Flow:
1. User clicks **"Create"**.
2. Odoo calls `default_get(['field1', 'field2', ...])`.
3. The method returns `{'field1': 'value1', ...}`.
4. The UI displays these values in the form.

---

## 2. Overriding default_get

Senior developers override this method to inject dynamic logic into the record initialization process.

```python
from odoo import api, models

class AuctionListing(models.Model):
    _inherit = 'auction.listing'

    @api.model
    def default_get(self, fields_list):
        # 1. Get standard defaults from the ORM
        res = super(AuctionListing, self).default_get(fields_list)
        
        # 2. Inject custom logic
        if 'start_date' in fields_list:
            # Pre-fill start date with "Tomorrow"
            res.update({
                'start_date': fields.Date.today() + timedelta(days=1)
            })
            
        # 3. Use Context for conditional defaults
        if self.env.context.get('default_category_id'):
            res['category_id'] = self.env.context['default_category_id']
            
        return res
```

---

## 3. default_get vs. default=...

| Feature | `default=...` on Field | `default_get()` Override |
| :--- | :--- | :--- |
| **Complexity** | Simple (static or lambda) | Complex (dynamic business logic) |
| **Context** | Limited access to context | Full access to `self.env.context` |
| **Performance** | Slightly faster | Can be slower if logic is heavy |
| **Use Case** | Constants (e.g., `active=True`) | Conditional (e.g., "If Category is X, set Price to Y") |

!!! tip "Senior Insight: The fields_list"
    Always check if a field is in `fields_list` before adding it to the result. This ensures you don't perform unnecessary calculations for fields that aren't even being requested by the view.

---

## 4. Common Patterns: default_get + Context

The most powerful way to use `default_get` is in combination with the **Context**.

If you open a window action with:
`context="{'default_auction_type': 'luxury'}"`

Odoo's standard `default_get` will automatically pick up any key starting with `default_` and add it to the initialization dictionary. You only need to override `default_get` if you need to transform that data or perform additional lookups.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** `default_get` prepares the UI state before the record exists in the database.
*   **Architect Insight:** Use `default_get` for multi-field dependencies (e.g., setting a default currency based on the selected seller) that are too complex for a simple `default` parameter.
*   **Verify Your Knowledge:** Does `default_get` trigger a database INSERT? (Answer: No, it only returns a dictionary of values to the UI).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
