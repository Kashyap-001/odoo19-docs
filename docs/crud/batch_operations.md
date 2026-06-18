---
title: Odoo 19 Batch Operations: Best Practices
description: Learn the difference between record-by-record processing and batch operations in Odoo 19. Optimize performance by minimizing ORM calls.
---

# Odoo 19: Batch Operations

A hallmark of a Senior Odoo developer is minimizing the number of ORM calls. Every time you call `write()`, `create()`, or `unlink()` on a single record inside a loop, you incur significant database overhead.

---

## 1. Batching vs. Iteration

### ❌ The "Junior" Trap (ORM Storm)
```python
# Terrible performance for large datasets!
for listing in listings:
    listing.write({'state': 'confirmed'})
```

### ✅ The "Senior" Solution (Batch Write)
```python
# Odoo performs this in ONE efficient SQL query
listings.write({'state': 'confirmed'})
```

---

## 2. When You CANNOT Batch
Sometimes business logic *requires* a loop (e.g., if each record needs different values). In these cases, you should prepare a list of dictionaries and perform a single batch operation at the end.

```python
vals_list = []
for listing in listings:
    # Logic to compute dynamic values
    new_val = compute_val(listing)
    vals_list.append({'id': listing.id, 'vals': {'price': new_val}})

# Still one single operation
listings.write(vals_list) 
```

---

## 3. 🏁 Senior Checkpoint
*   **Architect Insight:** Aim for *zero* ORM calls inside loops. Always push logic outside the loop by batching operations or preparing data structures.
*   **Pro Tip:** Use `env.add_to_compute()` or similar techniques when working with massive computed field updates to further optimize performance.
