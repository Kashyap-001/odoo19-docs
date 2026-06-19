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

### Beginner: Why "Command Tuples"?
Beginners often ask: *"Why can't I just pass a list of IDs like `write({'tags': [1,2,3]})`?"*

**The Problem:** Odoo needs to know *exactly* what you want to do with the existing relationship. 
- If you pass `[1, 2, 3]`, are you **adding** those IDs to the existing ones? 
- Are you **replacing** the existing ones? 
- Are you **removing** 1, 2, and 3 but keeping 4 and 5?

The Command Tuples (or `odoo.Command` helpers) remove this ambiguity. For example, `Command.set([1,2,3])` explicitly tells Odoo: "Clear all existing links and make these the only ones."

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

----

## 4. Record Duplication (copy)

For instructions and architectural details on how to duplicate records, override `copy()` and `copy_data()`, and use `copy=False` or `_copy_skip_fields`, please refer to the dedicated [copy() & copy_data() Guide](copy.md) page.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** `write()` updates all records in the active recordset in a single SQL operation.
*   **Architect Insight:** Always use the `Command` utility helper methods rather than legacy raw tuples when writing values to One2many or Many2many relational fields.
*   **Verify Your Knowledge:** Does `write()` support batch operations across multiple records? (Answer: Yes, it is batch-by-default; calling write on a recordset with N records executes an update across all N records simultaneously).

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
