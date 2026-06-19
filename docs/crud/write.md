---
title: Odoo 19 write() Method Tutorial — Updating Records and Relational Commands
description: Master the Odoo 19 write() method. Update fields in batch, use Command helper objects, and reference raw legacy tuples.
---

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

## Relational Commands: Modern `Command` Helpers vs. Legacy Raw Tuples

Updating relational fields (`One2many` or `Many2many`) is different from updating standard fields. You cannot pass a list of IDs directly. Instead, Odoo uses special commands. Modern Odoo 19 code uses the `odoo.Command` namespace, but legacy code and raw imports frequently use **Legacy Raw Tuples** (lists of 3-element tuples). 

Senior developers must be fluent in both formats:

| Command (Raw Tuple) | Modern `odoo.Command` Helper | Action / Description |
| :--- | :--- | :--- |
| **`(0, 0, {vals})`** | `Command.create({vals})` | **Create & Link**: Creates a new record in the comodel with the provided values, links it to this record, and saves it in the database. |
| **`(1, id, {vals})`** | `Command.update(id, {vals})` | **Update Linked**: Updates the linked record matching `id` with the provided field values. |
| **`(2, id, 0)`** or `(2, id)` | `Command.delete(id)` | **Unlink & Hard Delete**: Removes the relationship link and executes a SQL `DELETE` to completely remove the record from the database. |
| **`(3, id, 0)`** or `(3, id)` | `Command.unlink(id)` | **Unlink Only**: Breaks the relationship link, but keeps the record in the database (sets foreign key to `NULL` or deletes row in join table for Many2many). |
| **`(4, id, 0)`** or `(4, id)` | `Command.link(id)` | **Link Existing**: Creates a relationship link to an already existing record in the database. |
| **`(5, 0, 0)`** or `(5,)` | `Command.clear()` | **Unlink All**: Breaks all relationship links in the relation (but does not hard delete the related records). |
| **`(6, 0, [ids])`** | `Command.set([ids])` | **Replace All**: Replaces all existing links with the new list of IDs. Equivalent to running clear (`5`) followed by linking (`4`) for each ID. |

### Why Odoo Uses Commands
Beginners often ask: *"Why can't I just pass a list of IDs like `write({'tags': [1,2,3]})`?"*

**The Problem:** Odoo needs to know *exactly* what database action you want to perform on the associated records. 
- Do you want to **add** a tag without touching existing ones? Use `Command.link(id)` / `(4, id, 0)`.
- Do you want to **replace** the entire set? Use `Command.set([ids])` / `(6, 0, [ids])`.
- Do you want to **update** a line's description in-place? Use `Command.update(id, {'name': 'New'})` / `(1, id, {'name': 'New'})`.

Using `odoo.Command` or raw tuples removes this ambiguity and translates directly to optimized backend SQL commands.

### Modern vs. Legacy Syntax Comparison

=== "Modern (Command Namespace)"
    ```python
    from odoo import Command

    # Update listing tags, create a new bid, and delete an old one
    listing.write({
        'tag_ids': [Command.set([1, 2, 3])],
        'bid_ids': [
            Command.create({'amount': 1500.0, 'bidder_id': 5}),
            Command.delete(12)
        ]
    })
    ```

=== "Legacy (Raw Tuples)"
    ```python
    # Does the exact same database actions using raw Python lists/tuples
    listing.write({
        'tag_ids': [(6, 0, [1, 2, 3])],
        'bid_ids': [
            (0, 0, {'amount': 1500.0, 'bidder_id': 5}),
            (2, 12, 0)
        ]
    })
    ```

!!! danger "Common Mistake"
    Passing a raw list of IDs like `write({'tag_ids': [1, 2, 3]})` will **FAIL** with an ORM TypeError. You must wrap them in the `Command.set()` helper or use the raw tuple `(6, 0, [1, 2, 3])`.

---

## 💡 How to Remember: The "CURL LCS" Mnemonic

Relational commands are hard to memorize. Use the **"CURL LCS"** acronym to recall the most common ones:

*   **C**reate: **`Command.create()`** / `(0, 0, {vals})`
*   **U**pdate: **`Command.update()`** / `(1, id, {vals})`
*   **R**emove: **`Command.delete()`** / `(2, id, 0)`
*   **L**ink: **`Command.link()`** / `(4, id, 0)`
*   **L**ist: **`Command.set()`** / `(6, 0, [ids])` (Replace All)
*   **C**lear: **`Command.clear()`** / `(5, 0, 0)`
*   **S**ever: **`Command.unlink()`** / `(3, id, 0)`

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
