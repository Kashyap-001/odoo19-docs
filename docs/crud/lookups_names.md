---
title: Odoo 19 name_search & display_name Guide
description: Master Odoo 19 lookup logic, search_fetch(), and display_name computation for efficient Many2one fields.
---

# Odoo 19: name_get() and _name_search Lookups

... (See [Search Views](../foundation/search_view.md) for how these link to the search panel.)

When you select a record in a **Many2one** field, or when you type a search term in a search box, Odoo needs to know:
1.  **What to show?** (The display name)
2.  **How to find it?** (The lookup logic)

This is handled by `name_get()` (or the modern `display_name` compute) and `_name_search()`.

---

## 1. What is name_get()?

In older versions, `name_get()` returned a list of `(id, name)` tuples. In Odoo 19, this has been largely replaced by the **`display_name`** computed field, but the concept remains the same.

### Modern Implementation: display_name
Instead of overriding `name_get`, you now usually override the `_compute_display_name` method.

```python
class AuctionListing(models.Model):
    _name = 'auction.listing'
    
    name = fields.Char("Title")
    reference = fields.Char("Reference")

    @api.depends('name', 'reference')
    def _compute_display_name(self):
        for record in self:
            # Show "[REF] Title" in Many2one fields
            record.display_name = f"[{record.reference}] {record.name}"
```

---

## 2. Searching by Name: _name_search()

When a user types "Rolex" in a Many2one field for `auction.listing`, Odoo calls **`_name_search()`**.

By default, Odoo only searches the `name` field. Senior developers override this to allow searching by multiple fields (like `reference` or `internal_code`).

```python
@api.model
def _name_search(self, name, domain=None, operator='ilike', limit=100, order=None):
    # 1. Start with the provided domain
    domain = domain or []
    
    # 2. If the user typed something, search both 'name' and 'reference'
    if name:
        name_domain = ['|', ('name', operator, name), ('reference', operator, name)]
        domain = expression.AND([domain, name_domain])
        
    # 3. Use search_fetch() for performance in Odoo 19
    return self.search_fetch(domain, ['id'], limit=limit, order=order).ids
```

!!! tip "Performance: ilike vs =ilike"
    Using `ilike` with a leading `%` (e.g., `%rolex%`) prevents the database from using indexes. If you only want to search by the start of the string, use `operator='=ilike'`.

---

## 3. The name_create() Method

If a user types a name that doesn't exist in a Many2one field and clicks **"Create and Edit"**, Odoo calls `name_create(name)`. 

This is a shortcut to `create({'name': name})`. You can override it if you need to set more default values during this "Quick Create" flow.

```python
@api.model
def name_create(self, name):
    # Automatically set the state to 'draft' for quick-created auctions
    return self.create({'name': name, 'state': 'draft'}).name_get()[0]
```

---

## 4. Senior: Context-Aware Lookups

You can change what a Many2one field shows by passing information in the **Context**.

**Example:** Show the auction price in the lookup only when selecting for a bid.
```python
# In the View
<field name="auction_id" context="{'show_price_in_name': True}"/>

# In the Model
def _compute_display_name(self):
    for record in self:
        name = record.name
        if self.env.context.get('show_price_in_name'):
            name += f" (${record.start_price})"
        record.display_name = name
```

---

## 🏁 Senior Checkpoint
*   **Key Concept:** `display_name` controls the label; `_name_search` controls the searchability.
*   **Architect Insight:** Always use `expression.AND` when building domains in `_name_search` to ensure you don't accidentally ignore the user-provided domain filters.
*   **Verify Your Knowledge:** Does `_name_search` return a recordset? (Answer: No, it returns a list of IDs).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
