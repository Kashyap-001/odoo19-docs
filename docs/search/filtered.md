# Odoo filtered() Method

The `filtered()` method returns a recordset containing only the records that satisfy a specific condition.

---

## How it Works

Unlike `search()`, which queries the database, `filtered()` works **in-memory** on an existing recordset. This makes it very fast for small to medium recordsets that you have already loaded.

---

## Using a Lambda Function

You can pass a `lambda` function to `filtered()` to define complex conditions.

### Example
Filter partners who are customers and live in 'New York':

```python
ny_customers = partners.filtered(lambda r: r.customer_rank > 0 and r.city == 'New York')
```

---

## Using a Simple String

If you only need to check if a boolean field is `True`, you can simply pass the field name as a string.

### Example
Filter partners that are marked as companies:

```python
companies = partners.filtered('is_company')
```
*This is equivalent to `partners.filtered(lambda r: r.is_company)`.*

---

## In-Memory Filtering

!!! warning "Performance Tip"
    Because `filtered()` is an **in-memory** operation, you should:
    1.  Use `search()` if you need to filter thousands of records from the database.
    2.  Use `filtered()` when you already have a recordset and need to refine it further in your Python logic.

---

## Real-World Example

Imagine you have a list of Sale Orders and you want to quickly separate the "Done" orders from the "Draft" ones:

```python
# Get all orders for a partner
all_orders = partner.sale_order_ids

# Filter in-memory
draft_orders = all_orders.filtered(lambda o: o.state == 'draft')
confirmed_orders = all_orders.filtered(lambda o: o.state == 'sale')
```

---

## Summary Table

| Method | Target | Condition Type | Location |
| :--- | :--- | :--- | :--- |
| `search()` | Database | Domain List `[('field', '=', 'value')]` | Database (SQL) |
| `filtered()` | Recordset | Lambda or Field Name String | In-Memory (Python) |

---

## Senior: `filtered_domain()`

Odoo 13+ introduced `filtered_domain()`, a method that allows you to filter an in-memory recordset using standard **Odoo Domain syntax**.

### Why use it?
It allows you to reuse the same domain logic for both `search()` (database) and `filtered` (memory).

```python
domain = [('state', '=', 'active'), ('price', '>', 100)]

# 1. Use it for DB search
db_records = self.env['my.model'].search(domain)

# 2. Use the EXACT SAME domain to filter an existing recordset
memory_records = some_recordset.filtered_domain(domain)
```

!!! tip "Architect Tip"
    `filtered_domain()` is much more readable and maintainable than writing long, complex `lambda` functions for filtering.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
