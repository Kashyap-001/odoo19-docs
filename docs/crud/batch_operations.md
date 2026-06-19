---
title: Odoo 19 Batch Operations: Best Practices
description: Optimize your Odoo 19 code by mastering batch operations. Learn how to write efficient SQL updates, handle bulk creates, and avoid performance-killing loops.
---

# Odoo 19: Batch Operations & High-Performance Coding

A hallmark of a Senior Odoo developer is minimizing database hits. Every time you write, create, or unlink records inside a loop, Odoo executes individual round-trip SQL statements. At scale (thousands of records), this creates an "ORM Storm" that locks tables and slows down the entire system.

Odoo recordsets are designed to process operations in **batches** natively.

---

## 1. Batch Writes: Set-Based Updates

### ❌ The "Junior" Loop Trap
This code triggers N separate SQL `UPDATE` queries and invalidates the environment cache N times.
```python
# Terrible performance: 1000 listings = 1000 SQL queries!
for listing in listings:
    listing.write({'state': 'confirmed'})
```

### ✅ The "Senior" Solution (Set-based Write)
Calling `write()` on the entire recordset causes Odoo to execute **one single** SQL query.
```python
# Executed in a single SQL operation: UPDATE auction_listing SET state = 'confirmed' WHERE id IN (...)
listings.write({'state': 'confirmed'})
```

---

## 2. Batch Creates: `@api.model_create_multi`

When creating child records or importing data, never call `create()` inside a loop. Since Odoo 13 (and enforced strictly in Odoo 19), `create()` expects a **list of dictionaries** (`vals_list`) rather than a single dictionary.

### ❌ Individual Creates in a Loop
```python
# Triggers 500 individual INSERT queries and 500 cache updates
for data in bids_import_list:
    self.env['auction.bid'].create(data)
```

### ✅ Batch Creation
```python
# Overridden model definition
@api.model_create_multi
def create(self, vals_list):
    # Perform validation/sequences in batch
    for vals in vals_list:
        if not vals.get('name'):
            vals['name'] = 'Bid'
    # Single batch insertion in SQL
    return super().create(vals_list)

# Triggering bulk create
self.env['auction.bid'].create(bids_import_list)
```

---

## 3. Relational Batching with Command Helpers

When associating relational lists (like adding tags or invoices lines in bulk), prepare your data structures first, then execute a single write.

```python
from odoo import Command

# Bad: Writing to the relation in a loop
for bidder in bidders:
    listing.write({'bidder_ids': [Command.link(bidder.id)]})

# Good: Construct a list of commands, and execute in one write
commands = [Command.link(bidder.id) for bidder in bidders]
listing.write({'bidder_ids': commands})
```

---

## 4. Under the Hood: PostgreSQL Optimization

Why is batching so much faster?

| Metric | Record-by-Record Loop | Batch Recordset Operation |
| :--- | :--- | :--- |
| **SQL Queries** | $N$ queries | **1** query |
| **DB Locking** | Row locks acquired sequentially ($N$ times) | Single transaction lock (minimized risk of deadlocks) |
| **Cache Invalidation** | Cache cleared $N$ times | Cache updated once |
| **Network Latency** | High overhead of $N$ TCP socket round-trips | **1** database round-trip |

---

## 🏁 Senior Checkpoint

*   **Key Concept**: Aim for **zero** ORM writes or creates inside loops. Prepare lists/dictionaries first, then call the ORM once.
*   **Architect Insight**: Grouping writes not only speeds up execution but also prevents database deadlock conditions under heavy concurrent loads.
*   **Verify Your Knowledge**: How does `@api.model_create_multi` improve performance? (Answer: It allows the ORM to compile bulk `INSERT INTO ... VALUES` statements, performing multiple inserts in a single database command).

---

## 💻 Code Challenge

**Refactor this loop to update all draft listings to open in a single batch operation:**

```python
# Before:
# for listing in self.search([('state', '=', 'draft')]):
#     listing.write({'state': 'open'})
```

<div class="code-challenge">
<pre><code>self.search([('state', '=', 'draft')]).<input type="text" class="quiz-input-inline w-150" data-answer="write({'state': 'open'})">
</code></pre>
<button class="quiz-check" onclick="checkCodeChallenge(this)">Check Code</button>
<div class="quiz-result"></div>
</div>
