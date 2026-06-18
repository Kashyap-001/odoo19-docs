---
title: Odoo 19 Relational Commands: The Command Class
description: Learn the modern Odoo 19 Command class for One2many and Many2many field updates, replacing legacy tuple syntax.
---

# Odoo 19 Relational Commands: The Command Class

... (Essential for [Update operations](write.md).)

When updating `One2many` or `Many2many` fields, Odoo doesn't use simple values. It uses **Command Tuples**. While legacy code uses raw tuples like `(0, 0, {vals})`, Odoo 19 strictly uses the **`odoo.Command`** class for better readability and type safety.

---

## 1. Why Commands?
Relational fields are lists of links. If you want to update a list, Odoo needs to know *what* to do:
- Are you **adding** a new item?
- Are you **removing** an existing link?
- Are you **replacing** the whole list?

The `Command` class makes these intentions clear.

---

## 2. The Command Catalogue

```python
from odoo import Command
```

| Method | Legacy Tuple | Action | Description |
| :--- | :--- | :--- | :--- |
| **`Command.create(vals)`** | `(0, 0, vals)` | **CREATE** | Creates a new record and links it. |
| **`Command.update(id, vals)`** | `(1, id, vals)` | **UPDATE** | Updates an existing linked record. |
| **`Command.delete(id)`** | `(2, id, 0)` | **DELETE** | Unlinks AND permanently deletes from DB. |
| **`Command.unlink(id)`** | `(3, id, 0)` | **UNLINK** | Removes the link (does NOT delete record). |
| **`Command.link(id)`** | `(4, id, 0)` | **LINK** | Links an existing record by its ID. |
| **`Command.clear()`** | `(5, 0, 0)` | **CLEAR** | Removes all links (does NOT delete). |
| **`Command.set(ids)`** | `(6, 0, ids)` | **SET** | Clears all and replaces with new IDs. |

---

## 3. Real-World Usage Patterns

### Pattern A: Creating Parent & Children Together
Used in `create()` calls to build a structure in one SQL transaction.
```python
# Create an auction with two initial bids
self.env['auction.listing'].create({
    'name': 'Vintage Watch',
    'bid_ids': [
        Command.create({'amount': 100, 'user_id': 1}),
        Command.create({'amount': 120, 'user_id': 2}),
    ]
})
```

### Pattern B: Syncing Many2many Tags
Used in `write()` calls, usually from a UI selection.
```python
# Replace all tags with these specific IDs
listing.write({
    'tag_ids': [Command.set([5, 12, 18])]
})
```

### Pattern C: Safe Deletion in One2many
Used when you want to remove a line from an invoice and ensure it's deleted from the database.
```python
invoice.write({
    'line_ids': [Command.delete(line_id)]
})
```

---

## 4. Senior: Command Magic in Testing

When writing Unit Tests, `Command` makes your assertions much cleaner. Instead of checking indices in a tuple, you can use the named methods to verify intentions.

!!! danger "Common Pitfall: Mixing Commands"
    You can combine multiple commands in a single list:
    ```python
    listing.write({
        'tag_ids': [
            Command.link(5),    # Add tag 5
            Command.unlink(10), # Remove tag 10
        ]
    })
    ```
    However, be careful when mixing `Command.set()` with other commands, as `set()` will clear anything done by previous commands in the same list.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Relational fields require explicit commands to manage the graph of links.
*   **Architect Insight:** `Command.set()` is the most efficient way to "sync" Many2many data, as it optimizes the SQL `DELETE` and `INSERT` calls.
*   **Verify Your Knowledge:** What is the difference between `Command.delete()` and `Command.unlink()`? (Answer: `delete` removes the record from the DB; `unlink` only removes the relationship).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
