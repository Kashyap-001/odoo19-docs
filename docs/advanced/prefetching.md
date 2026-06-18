---
title: Odoo 19 Prefetching: Performance Secrets
description: Understand how Odoo's prefetch mechanism works to prevent SQL query storms. Learn how to optimize recordset access and avoid common performance traps.
---

# Odoo 19: The Prefetching Mechanism

A common performance bottleneck in Odoo is the "N+1 query problem." Odoo mitigates this automatically using its internal **Prefetching Mechanism**.

---

## 1. How Prefetching Works
When you access a field on a record (e.g., `record.partner_id.name`), Odoo does not just fetch that one field. It fetches that field for the current record **and for a batch of related records** loaded in the same recordset.

```python
# Even though we access partner_id one-by-one in a loop,
# Odoo fetches partner_id for all records in 'listings' in one efficient SQL query.
for listing in listings:
    _logger.info(listing.partner_id.name)
```

---

## 2. When Prefetching Breaks
Prefetching only works when you have a recordset of multiple records. If you break the recordset, you break the prefetch.

### ❌ The "Bad" Way (Breaking Prefetch)
```python
# Accessing one by one in a way that breaks the recordset
for i in range(len(listings)):
    # By accessing listings[i], we are creating a new recordset 
    # of size 1 in every iteration, forcing SQL queries every time.
    _logger.info(listings[i].partner_id.name)
```

### ✅ The "Senior" Way (Preserving Prefetch)
```python
# Iterate directly over the recordset
for listing in listings:
    _logger.info(listing.partner_id.name)
```

---

## 3. 🏁 Senior Checkpoint
*   **Architect Insight:** Always iterate over recordsets directly. Avoid indexing into recordsets inside loops (`records[i]`).
*   **Pro Tip:** Use `prefetch()` if you have a specific need to load data into the cache for future access, though Odoo's automatic mechanism covers most use cases.
