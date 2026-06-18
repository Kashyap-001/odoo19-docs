# Odoo 19: The write() Method

The `write()` method is used to update existing records in the database.

---

## How it Works
Unlike `create()`, the `write()` method:
- Takes a **single dictionary** of values.
- Updates **all records** in the current recordset.
- Returns `True` if the update was successful.

### Simple Example
```python
# Update a single record
listing = self.env['auction.listing'].browse(42)
listing.write({
    'state': 'published',
    'start_price': 200.0
})
```

---

## Relational Commands (The 5 Magic Tuples)

Updating relational fields (`One2many` or `Many2many`) is different from updating standard fields. You cannot pass a list of IDs directly. Instead, Odoo uses special "Command Tuples."

| Command Tuple | `odoo.Command` Helper | Action |
| :--- | :--- | :--- |
| `(0, 0, {vals})` | `Command.create({vals})` | Create a new record and link it. |
| `(1, id, {vals})` | `Command.update(id, {vals})` | Update an existing record. |
| `(2, id, 0)` | `Command.delete(id)` | **Remove and Delete** from database. |
| `(3, id, 0)` | `Command.unlink(id)` | **Unlink** only (removes relationship). |
| `(4, id, 0)` | `Command.link(id)` | Link an existing record. |
| `(5, 0, 0)` | `Command.clear()` | Remove ALL links (doesn't delete). |
| `(6, 0, [ids])` | `Command.set([ids])` | **Replace All** existing links with these IDs. |

### Most Common Patterns

**1. Adding a Single Tag (M2M)**
```python
from odoo import Command
listing.write({'tag_ids': [Command.link(new_tag_id)]})
```

**2. Replacing All Tags (M2M)**
This is the standard way to "sync" tags from a UI selection.
```python
listing.write({'tag_ids': [Command.set([1, 2, 3])]})
```

**3. Adding Bids (O2M)**
```python
listing.write({'bid_ids': [Command.create({'amount': 500})]})
```

!!! danger "Common Mistake"
    Passing a raw list of IDs like `write({'tag_ids': [1, 2, 3]})` will **FAIL** or behave unexpectedly. You must use the `Command.set` or tuple syntax.

---

## 💡 How to Remember: The "CURL LCS" Mnemonic

Relational commands are hard to memorize. Use the **"CURL LCS"** acronym to recall the most common ones:

*   **C**reate: **`Command.create()`**
*   **U**pdate: **`Command.update()`**
*   **R**emove: **`Command.delete()`**
*   **L**ink: **`Command.link()`**
*   **L**ist: **`Command.set()`** (Replace All)
*   **C**lear: **`Command.clear()`**
*   **S**ever: **`Command.unlink()`**

---

## Practical Examples

### 1. Updating Field and Adding a Child Record
To change the title of an auction and add a new bid simultaneously:
```python
from odoo import Command

listing.write({
    'name': 'Updated Luxury Watch',
    'bid_ids': [Command.create({'amount': 300.0, 'bidder_id': 12})]
})
```

### 2. Unlinking (Removing) Child Records
To remove specific bids from an auction without deleting the bid records themselves:
```python
listing.write({
    'bid_ids': [Command.unlink(5), Command.unlink(7)]  # Unlinks bids with ID 5 and 7
})
```

### 3. Replacing All Links
Often used for `Many2many` fields (like tags):
```python
listing.write({
    'tag_ids': [Command.set([1, 2, 5])] # Now the listing ONLY has tags 1, 2, and 5
})
```

---

## Important Tips
1. **Recordsets**: If `self` contains 10 records, `self.write({'active': False})` will archive all 10 records at once.
2. **Computed Fields**: Writing to a field that triggers a `@api.depends` will automatically cause the computed fields to recalculate.
3. **No Batch write()**: Unlike `create()`, there is no `write_multi`. `write()` is already "multi" because it acts on the entire recordset it is called on.

---

## Senior: Master of Duplication

When a user duplicates a record, Odoo's goal is to create a fresh copy while keeping the core data. As an architect, you must control this flow to prevent data corruption.

### 1. Preventing Duplication (`copy=False`)
By default, all fields are copied. You can prevent this at the field level:
```python
# The internal code should NEVER be duplicated
code = fields.Char("Reference", copy=False)
```

### 2. Odoo 19: `_copy_skip_fields`
Instead of adding `copy=False` to every field, you can define a list of fields to ignore during duplication at the model level. This is cleaner for models with many technical fields.

```python
class AuctionListing(models.Model):
    _name = 'auction.listing'
    _copy_skip_fields = ['state', 'bid_ids', 'winner_id']
```

### 3. Deep vs. Shallow Copying
- **Many2one:** Copied by default (The new record points to the same parent).
- **One2many:** **NOT** copied by default unless you explicitly allow it. This is to prevent "shared lines" where editing a line in the copy also changes the original.
- **Many2many:** Copied by default (The new record gets the same set of tags).

### 4. Overriding `copy_data()`
This is the **preferred** way to modify values during duplication.

```python
def copy_data(self, default=None):
    vals_list = super().copy_data(default=default)
    for vals in vals_list:
        # Append " (copy)" to the name
        if 'name' in vals:
            vals['name'] = _("%s (copy)", vals['name'])
    return vals_list
```

!!! tip "Architect Tip: Batch Performance"
    Odoo 19 uses `copy_data()` to generate values for *all* records being duplicated in a batch. Overriding `copy()` instead would trigger a loop of individual `create()` calls, which is significantly slower for large recordsets.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** `write()` updates recordsets; `copy()` clones them.
*   **Architect Insight:** `copy=False` and `_copy_skip_fields` are your primary tools for ensuring data integrity during duplication.
*   **Verify Your Knowledge:** What happens to a One2many field during duplication by default? (Answer: It is cleared/not copied to avoid data corruption between the original and the clone).

!!! success "Next Step"
    You can write. Now learn to find what you need with [Search & Domains](../search/search.md).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
