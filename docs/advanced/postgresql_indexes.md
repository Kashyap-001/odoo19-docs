---
title: Odoo 19 & PostgreSQL: Database Indexes & Optimization
description: Learn how to optimize Odoo 19 database queries using indexes. Master models.Index, index=True, and how to analyze query performance using EXPLAIN ANALYZE in PostgreSQL.
---

# PostgreSQL and Indexes: Database Optimization

At scale, database query performance is the primary bottleneck for Odoo installations. A single slow query can tie up a worker thread, leading to a cascade of blocked requests for all users. 

As a Senior Architect, you must know how to design efficient indexes and analyze execution plans using PostgreSQL's **`EXPLAIN ANALYZE`**.

---

## 1. Indexing Basics: `index=True`

Adding `index=True` to an Odoo field tells the ORM to create a standard B-tree database index on that column.

```python
# Create an index on the 'reference' field
reference = fields.Char("Reference", index=True)
```

### When to use index=True:
1.  **Search Fields**: Fields frequently used in search domains (e.g. `[('reference', '=', val)]`).
2.  **Join Fields (Many2one)**: Relational fields (e.g. `seller_id = fields.Many2one('res.users')`). *Odoo automatically indexes Many2one fields by default.*
3.  **Order By**: Fields used in sorting (`_order = 'date_end DESC'`).

---

## 2. Advanced Odoo 19 Indexes: `models.Index`

Odoo 19 replaces old-style SQL index overrides with the declarative **`models.Index`** wrapper, enabling composite, partial, and custom indexes directly in Python.

### Composite (Multi-field) Indexes
If you frequently query a model using multiple conditions, a single composite index can be much faster than individual indexes.

```python
from odoo import models, fields

class AuctionBid(models.Model):
    _name = 'auction.bid'

    listing_id = fields.Many2one('auction.listing')
    amount = fields.Monetary("Bid Amount")

    # Composite index: Speeds up queries searching by listing AND sorting by amount
    _listing_bid_idx = models.Index('(listing_id, amount DESC)')
```

### Partial (Conditional) Indexes
A **Partial Index** is an index built over a subset of a table defined by a conditional expression (a SQL `WHERE` clause). This reduces index size and keeps writing operations fast.

```python
class AuctionListing(models.Model):
    _name = 'auction.listing'
    state = fields.Selection([('draft', 'Draft'), ('active', 'Active'), ('done', 'Done')])

    # Index ONLY the active listings. Perfect for dashboards!
    _active_listing_idx = models.Index(
        '(id)', 
        where="state = 'active'"
    )
```

---

## 3. Tracing Bottlenecks with `EXPLAIN ANALYZE`

If a query is slow, do not guess which index to add. Execute the query directly on the PostgreSQL database prefixing it with `EXPLAIN (ANALYZE, BUFFERS)`.

```sql
EXPLAIN (ANALYZE, BUFFERS) 
SELECT id FROM auction_listing 
WHERE state = 'active' AND price > 5000;
```

### How to Read the Execution Plan

`EXPLAIN` outputs the query plan tree. Let's look at the two main search operations:

#### 1. Seq Scan (Sequential Scan) ❌
Postgres reads the entire table from disk page-by-page.
*   **Symptom**: High execution time, slow queries on large tables.
*   **Fix**: Add an index on the filter conditions.

```text
-> Seq Scan on auction_listing (cost=0.00..385.00 rows=15 width=4) (actual time=0.012..8.450 rows=12 loops=1)
   Filter: ((state = 'active'::text) AND (price > 5000))
```

#### 2. Index Scan / Index Only Scan ✅
Postgres queries the index directly to find matching records.
*   **Symptom**: Fast lookup, database buffers hit.
*   **Fix**: Query optimized.

```text
-> Index Scan using active_listing_idx on auction_listing (cost=0.15..12.30 rows=5 width=4) (actual time=0.004..0.025 rows=12 loops=1)
```

### EXPLAIN vs. EXPLAIN ANALYZE
*   **`EXPLAIN`**: Estimates the cost based on database statistics *without* actually running the query.
*   **`EXPLAIN ANALYZE`**: **Runs the query** and records actual execution times and buffer hits. 

> [!CAUTION]
> Because `EXPLAIN ANALYZE` executes the query, running it on an `UPDATE` or `DELETE` statement will modify database records. Wrap write queries in a rollback transaction when testing:
> ```sql
> BEGIN;
> EXPLAIN ANALYZE UPDATE ... ;
> ROLLBACK;
> ```

---

## 🏁 Senior Checkpoint

*   **Key Concept**: Indexes speed up read queries but slow down write operations (`create`, `write`, `unlink`) because the index must be updated in Postgres. Do not index columns with high write frequency unless necessary.
*   **Architect Insight**: Use partial indexes (`where="state='active'"`) for high-churn transactional tables to keep indexes small enough to fit entirely inside RAM memory buffers.
*   **Verify Your Knowledge**: What is the difference between an Index Scan and an Index Only Scan? (Answer: Index Scan fetches pointers from the index and then reads the table data; Index Only Scan reads the data directly from the index because all requested columns are stored within the index).

---

## 💻 Code Challenge

**Define a partial index in Odoo 19 that indexes the code field only for active partners (active = True):**

<div class="code-challenge">
<pre><code>class ResPartner(models.Model):
    _inherit = 'res.partner'
    
    code = fields.Char("Code")
    active = fields.Boolean("Active")
    
    _partner_code_idx = <input type="text" class="quiz-input-inline w-250" data-answer="models.Index('(code)', where=&quot;active = True&quot;)">
</code></pre>
<button class="quiz-check" onclick="checkCodeChallenge(this)">Check Code</button>
<div class="quiz-result"></div>
</div>
