---
title: Odoo 19 Performance Optimization: Mapping, Filtering, Sorting
description: Master ORM performance methods: mapped(), filtered(), sorted(), and read_group(). Learn how to manipulate recordsets efficiently in Odoo 19.
---

# Odoo 19: Performance Optimization Methods

As your application scales, you must avoid loading entire datasets into Python memory. Instead, use the ORM's powerful recordset manipulation methods to perform computations at the database level.

!!! info "SQL-Level Performance First"
    In-memory filtering and mapping are only effective once the database retrieval is optimized. Always ensure you are utilizing proper [PostgreSQL Indexes](../advanced/postgresql_indexes.md) and high-performance search methods like [search_fetch()](../crud/search_fetch.md) to query data efficiently.

---

## 1. Core Recordset Methods

| Method | Description | Use Case |
| :--- | :--- | :--- |
| `mapped()` | Extracts a specific field or transforms data. | Getting a list of IDs, names, or sums. |
| `filtered()` | Returns a subset of records matching a domain/function. | Replacing `for` loops with `if` conditions. |
| `sorted()` | Returns records ordered by field(s) or key. | Displaying results in a specific order. |

### Example: The Senior Approach
```python
# ❌ Junior: Loop and collect
names = []
for record in listings:
    names.append(record.name)

# ✅ Senior: Mapped
names = listings.mapped('name')

# ✅ Senior: Filtered (using domain)
active_listings = listings.filtered(lambda r: r.state == 'confirmed')
```

---

## 🏗️ Master Project Challenge: Optimization
1.  **Task**: You have 5,000 `auction.listing` records. Get a list of all unique owner IDs.
2.  **Goal**: Use `mapped()` to extract the `owner_id` field and convert it to a Python `set` to remove duplicates.

---

## 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. When should you use read_group() instead of a simple loop with sum()?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="When dealing with large datasets; read_group() performs aggregation at the database level, which is significantly faster." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

---

## 2. Advanced Aggregation: `read_group()`

Never use `len()` or `sum()` on large recordsets if you can avoid it. Use `read_group()` to perform aggregate SQL queries.

```python
# Group auctions by company and sum the total price
# This returns a list of dictionaries, not a recordset!
data = self.env['auction.listing'].read_group(
    domain=[('state', '=', 'confirmed')],
    fields=['price:sum'],
    groupby=['company_id']
)
```

---

## 3. 🏁 Senior Checkpoint
*   **Architect Insight:** `read_group()` is your best friend for reports and dashboards. It is thousands of times faster than iterating over records.
*   **Pro Tip:** If you find yourself writing complex `lambda` functions in `filtered()`, consider if a standard Odoo Domain (string-based) would be more efficient or readable.
