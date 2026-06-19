---
title: Odoo 19 Duplication: copy() and copy_data()
description: Master record duplication in Odoo 19. Learn how to override copy() and copy_data() for clean data duplication and how to control field copying using copy=False.
---

# Odoo 19 Duplication: copy() and copy_data()

When a user clicks the **"Duplicate"** button in the Odoo form interface, the system creates a new record by copying values from the existing one. 

As a senior developer, you must control this flow to prevent duplicating unique reference codes, active states, relational data anomalies, or other fields that should not be carried over.

```mermaid
graph TD
    UI[User clicks 'Duplicate'] --> Copy[copy()]
    Copy --> CopyData[copy_data()]
    CopyData --> DB[(PostgreSQL CREATE)]
```

---

## 1. The `copy()` Method

The `copy()` method is the high-level entry point for record duplication. It creates the new record and returns the new recordset.

```python
# Signature
def copy(self, default=None):
    ...
```

*   **`default`**: A dictionary containing values to override on the duplicate (e.g., `{'name': 'Duplicate Watch'}`).

### Overriding `copy()`
You should override `copy()` if you need to perform side-effects *after* the new record is created (e.g., logging activity or copying external physical files).

```python
from odoo import api, models

class AuctionListing(models.Model):
    _inherit = 'auction.listing'

    def copy(self, default=None):
        default = default or {}
        # Force state to draft on copy
        default.update({'state': 'draft'})
        
        # Call super to create the new record
        new_record = super().copy(default=default)
        
        # Post activity on the new record
        new_record.activity_schedule(
            'mail.mail_activity_data_todo',
            summary="Review duplicated listing"
        )
        return new_record
```

---

## 2. The `copy_data()` Method

`copy_data()` is the low-level method that generates the dictionary of field values that will be passed to `create()` for duplication.

```python
# Signature
def copy_data(self, default=None):
    ...
```

*   **Why override `copy_data()` instead of `copy()`?**
    *   **Performance:** Odoo 19 is fully optimized for batch operations. When duplicating records in bulk, `copy_data()` generates values for *all* records in a single pass, enabling a batch `create()`. Overriding `copy()` forces Odoo to fallback to slow record-by-record creation.
    *   **Cleaner Values:** It is the standard place to modify field values (e.g., adding `(copy)` to names).

```python
from odoo import api, models, _

class AuctionListing(models.Model):
    _inherit = 'auction.listing'

    def copy_data(self, default=None):
        # vals_list contains dictionaries of values for each record in the copy batch
        vals_list = super().copy_data(default=default)
        for vals in vals_list:
            if 'name' in vals:
                vals['name'] = _("%s (copy)", vals['name'])
        return vals_list
```

---

## 3. Controlling Copy Behavior on Fields

Odoo gives you two ways to prevent fields from being copied to the duplicated record:

### Method A: Field Attribute (`copy=False`)
Setting `copy=False` on a field definition ensures it is excluded from `copy_data()`.

```python
# Unique transaction codes should NEVER be copied
transaction_code = fields.Char("Transaction Ref", required=True, copy=False)
```

### Method B: Model Attribute (`_copy_skip_fields`)
Odoo 19 allows you to define a list of fields to ignore during duplication at the class level. This keeps field declarations clean when many technical status fields are present.

```python
class AuctionListing(models.Model):
    _name = 'auction.listing'
    _copy_skip_fields = ['state', 'bid_ids', 'winner_id']
```

---

## 4. Relational Copy Behavior & The One2many Trap

Duplicating relational fields requires careful architectural planning to avoid data integrity bugs.

### Default Relational Behavior
*   **Many2one**: **Copied** by default. The duplicate points to the exact same parent record.
*   **Many2many**: **Copied** by default. The duplicate gets linked to the same list of tags/categories.
*   **One2many**: **NOT Copied** by default (`copy=False` is implicit).

### ❌ The One2many Duplicate Trap
If you force a One2many field to copy by setting `copy=True`, you can cause severe data issues.

```python
# DANGEROUS! Setting copy=True on O2M fields causes duplicate child rows
# that link to the parent, potentially causing data overlapping or crashes.
line_ids = fields.One2many('auction.line', 'listing_id', copy=True)
```

If you need to copy the child records of a One2many field, the **safe** and standard way is to copy the child records explicitly and re-assign them using the `Command` utility inside `copy()`.

```python
from odoo import Command

def copy(self, default=None):
    default = default or {}
    # Copy lines explicitly to ensure fresh records are created
    default['line_ids'] = [
        Command.create(line.copy_data()[0]) for line in self.line_ids
    ]
    return super().copy(default=default)
```

---

## 🏁 Senior Checkpoint

*   **Key Concept**: Use `copy_data()` to prepare field values and `copy()` to handle post-creation logic.
*   **Architect Insight**: Prefer overriding `copy_data()` to ensure your module stays compatible with Odoo 19's batch processing engine.
*   **Verify Your Knowledge**: What happens to a field defined as `copy=False` during duplication? (Answer: It is omitted from the values dictionary, and when the new record is created, the field gets its default value or remains empty).

---

## 💻 Code Challenge

**Implement a copy_data override that appends the string ' [DUP]' to the name field of the copied listing:**

<div class="code-challenge">
<pre><code>def copy_data(self, default=None):
    vals_list = <input type="text" class="quiz-input-inline w-200" data-answer="super().copy_data(default=default)">
    for vals in vals_list:
        if 'name' in vals:
            vals['name'] = f"{vals['name']} [DUP]"
    return vals_list
</code></pre>
<button class="quiz-check" onclick="checkCodeChallenge(this)">Check Code</button>
<div class="quiz-result"></div>
</div>

---
