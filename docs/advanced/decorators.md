---
tags:
  - Python
  - ORM
  - Reactivity
  - Odoo 19
---

# Odoo 19 API Decorators

API decorators are used to define the behavior of methods in Odoo models. They tell the Odoo framework how and when a method should be executed.

## @api.depends
The `@api.depends` decorator is used for **Computed Fields**. It specifies the fields that the computation depends on. When any of these "dependencies" change, Odoo automatically recomputes the field.

### Example
In this example, the `total` field depends on `amount` and `tax`.

```python title="models/sale_order.py"
from odoo import api, fields, models

class SaleOrder(models.Model):
    _name = 'sale.order'

    amount = fields.Float()
    tax = fields.Float()
    total = fields.Float(compute='_compute_total', store=True)

    @api.depends('amount', 'tax')
    def _compute_total(self):
        for record in self:
            record.total = record.amount + (record.amount * record.tax)
```

> **Note:** You can use dotted paths for relational fields, like `@api.depends('partner_id.name')`.

---

## @api.constrains
The `@api.constrains` decorator is used for **Python Validation**. It ensures that the data entered by the user meets specific business rules before it is saved to the database.

### Example
This example ensures that the `age` of a person is at least 18.

```python title="models/res_person.py"
from odoo import api, fields, models
from odoo.exceptions import ValidationError

class Person(models.Model):
    _name = 'res.person'

    age = fields.Integer()

    @api.constrains('age')
    def _check_age(self):
        for record in self:
            if record.age < 18:
                raise ValidationError("The person must be at least 18 years old.")
```

> **Important:** `@api.constrains` does **not** support dotted paths. You can only constrain fields belonging to the current model.

---

## @api.onchange
The `@api.onchange` decorator is used to provide **Immediate Feedback** in the User Interface (Form View). When a user changes a field value, the `onchange` method can automatically update other fields on the screen *before* the record is saved.

### Example
When the `partner_id` is changed, automatically set the `email` from that partner.

```python title="models/project_task.py"
from odoo import api, fields, models

class Task(models.Model):
    _name = 'project.task'

    partner_id = fields.Many2one('res.partner')
    email = fields.Char()

    @api.onchange('partner_id')
    def _onchange_partner_id(self):
        if self.partner_id:
            self.email = self.partner_id.email
```

### When to use what?

```mermaid
graph TD
    Start([Need to trigger logic?]) --> UI{Only in UI / Form?}
    UI -- Yes --> Onchange[@api.onchange]
    UI -- No --> Persist{Store result in DB?}
    
    Persist -- Yes --> Depends[@api.depends]
    Persist -- No --> Validate{Is it for security/rules?}
    
    Validate -- Yes --> Constrains[@api.constrains]
    Validate -- No --> Model[@api.model / others]
```

| Decorator | Purpose | Triggers |
| :--- | :--- | :--- |
| **@api.depends** | Compute values | When dependencies change (Database) |
| **@api.constrains** | Data Validation | On Create and Write (Database) |
| **@api.onchange** | UI Updates | When field changes in Form View (UI) |

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Decorators define the "Reactivity" of your Python methods.
*   **Architect Insight:** Never use `@api.onchange` for business-critical logic; it ONLY runs in the browser. Use `@api.depends` for data integrity.
*   **Verify Your Knowledge:** Why can't you use dotted paths in `@api.constrains`? (Answer: Because constraints are database-level and must be local to the table).

!!! success "Next Step"
    Logic is reactive. Now learn to build interactive [Wizards](../wizards/wizards.md).

---

## 🛠️ Master Project Challenge: Dynamic Pricing
Our auctions use tiered increments (e.g., if the price is > $1000, the minimum bid jump must be $50).

**Goal:** Implement the logic for the "Current Price" and "Next Minimum Bid."
1.  Create a computed field `current_price` that depends on `bid_ids.amount`.
2.  Use `@api.depends` to calculate the highest bid.
3.  Add a Python `@api.constrains` to ensure no one places a bid lower than the `current_price` + tiered increment.

??? success "Show Solution"
    ```python title="models/auction_listing.py"
    @api.depends('bid_ids.amount')
    def _compute_current_price(self):
        for record in self:
            record.current_price = max(record.bid_ids.mapped('amount')) if record.bid_ids else 0.0

    @api.constrains('amount', 'listing_id')
    def _check_minimum_bid(self):
        for record in self:
            min_increment = 50 if record.listing_id.current_price > 1000 else 10
            if record.amount < record.listing_id.current_price + min_increment:
                raise ValidationError("Bid is too low!")
    ```

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
