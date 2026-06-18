# Cache Management: Flush, Invalidate, and Clear

Odoo's ORM uses an internal **Registry Cache** to store record values. This minimizes database hits, but for Senior Developers, understanding how to manually manipulate this cache is critical for data integrity and performance.

---

## 1. How the Cache Works

When you read a field (e.g., `record.name`), Odoo:
1.  Checks if the value is in the **Python Cache**.
2.  If not, it fetches it from **PostgreSQL**.
3.  Stores the value in the cache for future use in the same transaction.

### The "Write" Delay
When you update a field (`record.name = "New"`), Odoo **does not** immediately send an `UPDATE` SQL command. Instead:
- It updates the **Cache**.
- It marks the record as **Dirty**.
- It waits until the end of the transaction or a manual **Flush** to sync with PostgreSQL.

---

## 2. Manual Synchronization (Flush)

Use `flush_recordset()` when you need to ensure that values in the Python cache are written to the physical database (PostgreSQL).

### Why Flush?
- **Raw SQL**: If you are about to run a `self.env.cr.execute("SELECT ...")`, the database won't see your recent Python changes unless you flush them first.
- **External Calls**: Before calling an external API that might read from your database.

```python
# Force-syncing changes to the DB
self.env['auction.listing'].flush_model(['name', 'state'])

# Or flush specific records
my_auction.flush_recordset(['highest_bid'])
```

---

## 3. Invalidation (Invalidate)

`invalidate_recordset()` does the opposite of flush. It removes values from the Python cache, forcing Odoo to fetch them fresh from the database on the next access.

### Why Invalidate?
- **Concurrency**: If another process or a raw SQL `UPDATE` has modified the database, your Python cache is "stale."
- **Testing**: To ensure a compute method is actually re-triggering and not just reading from cache.

```python
# Clear the cache for specific fields
self.env.cache.invalidate() # Clears EVERYTHING (Extreme performance hit)

# Recommended: Clear only what changed
self.env['auction.listing'].invalidate_model(['current_price'])
```

---

## 4. The `self.env.cr.savepoint()`

Cache management is closely tied to transactions. If a transaction fails, the cache must be rolled back to match the database state.

!!! warning "Senior Tip: Transaction Safety"
    When performing high-risk operations in a loop, use a savepoint. If it fails, Odoo handles the cache rollback for you.
    ```python
    try:
        with self.env.cr.savepoint():
            record.write({'state': 'done'})
    except Exception:
        # The cache for 'record' is automatically reverted!
        _logger.error("Failed to update record")
    ```

---

## 5. Clearing the Whole Cache

In very rare cases (usually long-running migration scripts or heavy cron jobs), the cache can grow so large that it consumes all available RAM.

```python
# Clear the environment cache and the registry cache
self.env.registry.clear_cache()
```

!!! danger "Performance Warning"
    Clearing the global cache will cause every subsequent operation in every session to hit the database. **Never** use this in a standard UI action.

---

## Summary Table

| Method | Direction | Purpose |
| :--- | :--- | :--- |
| **`flush_model()`** | Cache → DB | Write pending changes to PostgreSQL. |
| **`invalidate_model()`** | DB → Cache | Forget cached values; force a fresh fetch. |
| **`clear_cache()`** | Destroy | Wipe everything (Registry level). |

---

## 🚀 Senior Insight: The Prefetching Engine

Odoo 19 uses a **Shared Prefetching Buffer** to eliminate the N+1 query problem automatically.

### How it Works:
When you load a recordset (e.g., via `search`), Odoo stores all record IDs in a "Prefetch Set." The first time you access a field on any record, Odoo fetches that field for **every record in the set** at once.

### Manual Control:
If you are processing millions of records and want to save memory by disabling this behavior, use `with_prefetch`:

```python
# Create a recordset that will NOT trigger prefetching for others
fast_records = records.with_prefetch(False)
```

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Odoo caches record values to minimize database load.
*   **Architect Insight:** `flush()` writes to DB; `invalidate()` forces a re-read. Use them when combining ORM with raw SQL.
*   **Verify Your Knowledge:** Why is `clear_cache()` dangerous? (Answer: It wipes the global registry cache, forcing EVERY subsequent request to hit the database).

!!! success "Next Step"
    ORM complete. Now explore [Enterprise Features](../multi_company/logic.md) like Multi-Company support.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
