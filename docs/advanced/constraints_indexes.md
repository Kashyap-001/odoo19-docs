---
title: Odoo 19 Constraints and Indexes Tutorial — models.Constraint & models.Index
description: Learn how to configure database validation rules and composite indexes using Odoo 19 declarative Constraint and Index classes.
---

# Odoo 19 Constraints and Indexes

Odoo 19 introduces a more modern and declarative way to handle database-level constraints and indexes using the `models.Constraint` and `models.Index` classes.

## Database Constraints (models.Constraint)
In Odoo 19, the old `_sql_constraints` list is replaced by individual class attributes using `models.Constraint`. This makes constraints easier to read and inherit.

### Unique Constraint
Ensures that no two records have the same value in a specific field.

```python
from odoo import models, fields

class Product(models.Model):
    _name = 'hospital.patient'

    code = fields.Char(required=True)

    # UNIQUE constraint
    _unique_code = models.Constraint(
        'UNIQUE(code)',
        'The patient code must be unique!'
    )
```

### Check Constraint
Ensures that a field value meets a specific SQL condition (e.g., must be positive).

```python
class Stock(models.Model):
    _name = 'stock.inventory'

    quantity = fields.Integer()

    # CHECK constraint
    _check_quantity = models.Constraint(
        'CHECK(quantity >= 0)',
        'Quantity cannot be negative!'
    )
```

---

## SQL Constraints vs. Python Constraints (@api.constrains)

Odoo offers two ways to enforce data rules. Choosing the right one is a key "Senior" decision.

| Feature | SQL Constraint (`models.Constraint`) | Python Constraint (`@api.constrains`) |
| :--- | :--- | :--- |
| **Enforcement** | **PostgreSQL Level** (Absolute) | **Odoo ORM Level** (Software) |
| **Performance** | Extremely Fast | Slower (requires Python execution) |
| **Scope** | Simple Logic (Unique, Check, etc.) | Complex Logic (relational lookups, multi-model) |
| **Trigger** | SQL Insert/Update | Odoo `create()` / `write()` calls |

**Architect Tip**: Use **SQL Constraints** whenever possible for simple rules (like uniqueness or positive numbers). Use **Python Constraints** only when your rule requires looking up data in other models or complex business logic that SQL cannot easily express.

---

## Database Indexes (models.Index)
Indexes are used to speed up database searches. While you can still use `index=True` on a field, Odoo 19 provides `models.Index` for more advanced scenarios like composite indexes.

### Simple Field Index
The easiest way to add an index is on the field definition:
```python
name = fields.Char(index=True)
```

### Composite Index (Multi-field)
If you frequently search or filter by two fields together, a composite index can significantly improve performance.

```python
class AuctionBid(models.Model):
    _name = 'auction.bid'

    listing_id = fields.Many2one('auction.listing')
    bid_amount = fields.Float()

    # Composite index on listing_id and bid_amount
    _listing_bid_idx = models.Index('(listing_id, bid_amount)')
```

### Custom Index Options
You can also specify sorting order or other PostgreSQL-specific index options.

```python
# Index for descending date searches
_date_idx = models.Index('(create_date DESC)')
```

### Senior: Partial Indexing
A **Partial Index** is an index created on a subset of rows in a table. This is extremely efficient for tables with millions of records where you only ever care about a few (e.g., "Active" auctions).

```python
# Creates an index ONLY for active records. 
# The index size is tiny compared to a full table index.
_active_listing_idx = models.Index(
    '(id)', 
    where="state = 'active'"
)
```

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Constraints enforce data integrity at the database level; Indexes speed up searches.
*   **Architect Insight:** Partial Indexes (`where="state='active'"`) are the most efficient way to optimize dashboard performance without bloating the DB size.
*   **Verify Your Knowledge:** What happens if a Python constraint fails? (Answer: The transaction is rolled back and an error is shown to the user).

!!! success "Next Step"
    Performance mastered. Now learn about [Cache Management](cache_management.md).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
