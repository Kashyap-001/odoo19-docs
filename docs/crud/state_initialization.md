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

## 4. Prefilling with Context Defaults

The most powerful way to use `default_get` is in combination with the **Context**. 

Odoo has a built-in convention: any key in the context starting with the prefix `default_` is automatically extracted by the standard `default_get()` method and assigned as the default value for the matching field.

For example, if you define a Window Action or open a form passing this context:
`context="{'default_state': 'draft', 'default_price': 100.0}"`

Odoo's `default_get()` will automatically return `{'state': 'draft', 'price': 100.0}` to the form view, without you writing a single line of Python code!

---

## 5. Wizard State Initialization (Active Record Linking)

Wizards (TransientModels) heavily rely on `default_get` to link themselves to the records from which they were opened. When a user clicks a button to open a wizard, Odoo populates the context with:
*   `active_id`: The ID of the record currently active in the form view.
*   `active_ids`: A list of selected record IDs (e.g. from a list view checklist).
*   `active_model`: The model name of the calling view (e.g. `auction.listing`).

You can override `default_get` on the wizard class to pull these values and pre-fill details.

### Example: Bid confirmation wizard
```python
class BidConfirmWizard(models.TransientModel):
    _name = 'auction.bid.confirm.wizard'
    _description = 'Confirm Bid Wizard'

    listing_id = fields.Many2one('auction.listing', string="Listing", required=True)
    amount = fields.Float("Bid Amount")

    @api.model
    def default_get(self, fields_list):
        res = super(BidConfirmWizard, self).default_get(fields_list)
        
        # Check if the wizard is opened from an auction listing form
        active_model = self.env.context.get('active_model')
        active_id = self.env.context.get('active_id')
        
        if active_model == 'auction.listing' and active_id:
            listing = self.env['auction.listing'].browse(active_id)
            if 'listing_id' in fields_list:
                res['listing_id'] = listing.id
            if 'amount' in fields_list:
                # Pre-fill with the next valid bid amount (current price + increment)
                res['amount'] = listing.current_price + 10.0
                
        return res
```

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
