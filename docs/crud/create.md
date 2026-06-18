# Odoo 19 CRUD: The create() Method

The `create()` method is the gateway for inserting data into your Odoo database. In modern Odoo (v13+ through v19), this method is optimized for high-performance batch processing.

---

## 1. @api.model_create_multi
The standard `create()` method is always decorated with `@api.model_create_multi`. This decorator ensures that the method receives a **list of dictionaries** (`vals_list`) rather than a single dictionary.

### Structural Breakdown
```python
@api.model_create_multi
def create(self, vals_list):
    # vals_list = [{'name': 'A', ...}, {'name': 'B', ...}]
    records = super(MyModel, self).create(vals_list)
    return records
```

*   **Input**: A list of dictionaries, where each dictionary key is a field name.
*   **Output**: A recordset containing all newly created records in the same order as the input list.

!!! tip "Performance Tip"
    Never call `create()` inside a `for` loop. Instead, collect your data into a list of dictionaries and call `create()` once. This reduces the number of SQL `INSERT` statements and cache invalidations.

---

## 2. Relational Creation Commands (using Command)
When creating a record that has `One2many` or `Many2many` relationships, you can create the parent and the children in a single atomic call using the **`Command`** class.

```python
from odoo import Command
```

| Method | Command | Structure | Description |
| :--- | :--- | :--- | :--- |
| **`Command.create(vals)`** | **CREATE** | `(0, 0, {'name': 'Line 1'})` | Creates a new child record and links it. |
| **`Command.link(ID)`** | **LINK** | `(4, 12, 0)` | Links an existing record with ID 12. |
| **`Command.set([IDs])`** | **SET** | `(6, 0, [1, 2, 3])` | Replaces all links with the provided IDs. |

!!! info "Modern vs. Legacy"
    While Odoo still supports the "magic tuple" format `(0, 0, {...})`, the `Command` class is the preferred standard for Odoo 19 because it is more readable and less error-prone.

---

## 3. Real-World Complex Example
### Creating a Sales Order with Multiple Lines
Imagine you need to create a Sales Order for a customer with three different products. Doing this in one call is faster and safer (if one line fails, the whole transaction rolls back).

!!! example "Try it Yourself: One-Call Creation"
    ```python
    from odoo import Command

    def create_bulk_order(self):
        vals_list = [{
            'partner_id': 12,  # Customer ID
            'date_order': '2026-06-16',
            'order_line': [
                # Using Command.create() to create lines
                Command.create({
                    'product_id': 101,
                    'product_uom_qty': 2,
                    'price_unit': 150.0,
                }),
                Command.create({
                    'product_id': 102,
                    'product_uom_qty': 1,
                    'price_unit': 500.0,
                }),
                Command.create({
                    'product_id': 105,
                    'product_uom_qty': 10,
                    'price_unit': 15.0,
                }),
            ]
        }]
        
        # This creates 1 Sales Order and 3 Sales Order Lines in one call
        new_order = self.env['sale.order'].create(vals_list)
        return new_order
    ```

---

## 4. How to Initialize Data (default_get)
Before `create()` is even called, Odoo uses the `default_get()` method to prepare the initial values shown in the UI. 

- **Goldmine Insight**: If you want to pre-fill a form based on the user's last action, you override `default_get`.
- **Learn More**: See the full guide on [State Initialization & default_get](state_initialization.md).

---

## 5. Best Practices for create()

1.  **Prepare the List**: Always start by initializing an empty `vals_list = []` and appending your dictionaries.
2.  **Use ID references**: For Many2one fields, use the integer ID (e.g., `'partner_id': 5`) rather than a recordset.
3.  **Validation**: If you need to check logic before creation, use `@api.constrains` or override `create()`. If you override, always call `super()`.
4.  **Default Values**: Odoo automatically applies the `default=...` values defined on your fields. You don't need to include them in your `vals_list` unless you want to override them.

!!! warning "Transaction Safety"
    Since `create()` uses a single database transaction, if any dictionary in `vals_list` is invalid (e.g., missing a required field), **none** of the records will be created.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** `@api.model_create_multi` is mandatory for high-performance batch creation.
*   **Architect Insight:** Command tuples (0, 0, {vals}) allow creating complex parent-child structures in a single atomic SQL transaction.
*   **Verify Your Knowledge:** Why is it bad to call `create()` inside a loop? (Answer: It triggers N+1 SQL INSERTs and slows down the registry cache).

!!! success "Next Step"
    Insertion complete. Now learn to [Read Data](read.md) efficiently.

---

## 🛠️ Master Project Challenge: Bulk Bidding
The Auction app needs to handle high volumes. Let's implement batch creation for bids.

**Goal:** Create a method that accepts a list of bid amounts and creates them in one transaction.
1.  Use the `@api.model_create_multi` decorator.
2.  Iterate through the `vals_list`.
3.  Ensure each bid is linked to an `auction_id`.
4.  Call `super().create()` once.

??? success "Show Solution"
    ```python title="models/auction_bid.py"
    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('auction_id'):
                # Validate or set auction_id
                pass
        return super().create(vals_list)
    ```

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
