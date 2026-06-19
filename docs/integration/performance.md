---
tags:
  - Database
  - Performance
  - SQL
  - ORM
title: Odoo 19 SQL Performance Tutorial — Query Optimization and EXPLAIN
description: Master database query speed in Odoo 19. Learn how to optimize joins, analyze execution plans, and write high-performance HTTP routes.
---

# SQL & ORM Performance: The Senior Developer's Guide

In a marketplace like our Auction app, thousands of bids can happen simultaneously. If your code isn't optimized, the system will crawl. This guide covers the essential "Three Pillars of Odoo Performance."

---

## 1. The N+1 Query Problem

The **N+1 problem** is the most common cause of slow Odoo modules. It happens when you fetch a list of records (1 query) and then perform another query for *each* record in that list (N queries).

### Visualizing the Bottleneck

**Scenario:** We want to count how many bids each auction listing has.

| Method | Database Interaction | Traffic | Efficiency |
| :--- | :--- | :--- | :--- |
| **Naive (N+1)** | `SELECT * FROM listings` <br> `SELECT COUNT(*) FROM bids WHERE listing_id=1` <br> `SELECT COUNT(*) FROM bids WHERE listing_id=2` <br> ... | 1 + 100 queries | ❌ Very Poor |
| **Optimized** | `SELECT * FROM listings` <br> `SELECT listing_id, count(*) FROM bids GROUP BY listing_id` | 1 + 1 queries | ✅ Excellent |

---

## 2. Advanced: `_read_group()` & Grouping Sets

Odoo 19 provides the `_read_group()` method to aggregate data (SUM, COUNT, MAX) efficiently. It now supports **Grouping Sets** and native SQL aggregations.

```python
results = self.env['auction.bid']._read_group(
    domain=[],
    groupby=['listing_id'],
    aggregates=['amount:sum', '__count']
)
```

---

## 3. SQL Indexes vs. Odoo `models.Index`

An index is like a book's index: it allows Odoo to find records without scanning every single row in the database table.

### Basic Indexing (`index=True`)
Use this on fields that are frequently used in search filters or `domain` strings.
```python
state = fields.Selection([('draft', 'Draft'), ('open', 'Open')], index=True)
```

### Advanced: Odoo 19 `models.Index`
Sometimes searching a single field isn't enough. If your auction app frequently searches by **Seller** AND **State** together, a standard index is slow. You need a **Composite Index**.

```python
class AuctionListing(models.Model):
    _name = 'auction.listing'
    
    seller_id = fields.Many2one('res.partner')
    state = fields.Selection([...])

    # Odoo 19 Declarative Index (Class Attribute)
    # This creates a native PostgreSQL index on BOTH columns.
    _seller_state_idx = models.Index('(seller_id, state)')
```

### When to add an Index?
- ✅ **YES:** Fields used in `_order`, `search()`, or `_read_group()`.
- ✅ **YES:** Many2one fields (usually indexed by default).
- ❌ **NO:** Fields with low cardinality (e.g., a Boolean `is_active` where 99% are True).
- ❌ **NO:** Text/HTML fields (they make the index too large).

---

## 4. Summary Checklist

1. **Batch Everything:** Never use `search()` inside a loop.
2. **Aggregates First:** Use `_read_group()` for counts and totals.
3. **Limit Fields:** Use `search_fetch()` [New in v19] to only load the specific columns you need from the database.
4. **Index Strategically:** Only index fields that are actually used as filters.

!!! tip "Performance Tool"
    In Odoo 19, you can use `self.env.cr.statistics` to see exactly how many SQL queries were executed by your current method.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
