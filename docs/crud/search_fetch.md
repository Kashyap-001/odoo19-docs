# Odoo 19: search_fetch() vs search()

Odoo 19 introduces `search_fetch()`, a high-performance alternative to the traditional `search()` method. It is designed to minimize database overhead by combining searching and field retrieval into a single step.

---

## 1. Why use search_fetch()?

In older Odoo versions, `search()` only retrieved record IDs. When you later accessed a field (like `record.name`), Odoo had to perform a second SQL query (the "fetch") to get the data.

**`search_fetch()`** solves this by:
1.  Performing the search and the data retrieval in **one single SQL query**.
2.  Fetching **only** the fields you specify, reducing the amount of data transferred from PostgreSQL.

!!! info "Performance Boost"
    `search_fetch()` can be up to 50% faster than `search()` when dealing with large recordsets because it eliminates the "N+1" query problem and reduces memory usage.

---

## 2. SQL Level Optimization
When you call `search_fetch(domain, fields)`, Odoo generates a `SELECT` statement that specifically names your fields:

*   **Traditional `search()`**: `SELECT id FROM table WHERE ...`
*   **New `search_fetch()`**: `SELECT id, name, date FROM table WHERE ...`

This prevents Odoo from fetching large fields (like `Binary` or `Text` blobs) that you don't need, which is a common performance bottleneck.

---

## 3. Code Comparison

### Traditional Way: search()
```python
# Query 1: Get IDs
records = self.env['auction.listing'].search([('state', '=', 'active')])

# Query 2 (Lazy): Get names when first accessed
for rec in records:
    print(rec.name)
```

### Modern Odoo 19 Way: search_fetch()
```python
# Single Query: Get IDs AND 'name' in one go
records = self.env['auction.listing'].search_fetch(
    domain=[('state', '=', 'active')],
    field_names=['name', 'start_price']
)

# No more queries needed! Data is already in the cache.
for rec in records:
    print(rec.name)
```

!!! example "Try it Yourself: Best of Both Worlds"
    If you need to fetch data for many records but don't know exactly which ones yet, `search_fetch()` is your best friend.
    ```python
    # Fetch top 10 most expensive auctions with their titles
    top_auctions = self.env['auction.listing'].search_fetch(
        domain=[], 
        field_names=['name', 'highest_bid'], 
        order='highest_bid desc', 
        limit=10
    )
    ```

---

## 4. When to use which?

| Use Case | Recommended Method | Reason |
| :--- | :--- | :--- |
| Checking if records exist | `search_count()` | Fast, returns only an integer. |
| Getting records for processing | `search()` | Good for small sets or when you need many fields. |
| **High-Performance UI/Reports** | **`search_fetch()`** | Fastest way to get specific data for many records. |
| Web Controllers / APIs | `search_read()` | Returns a list of dictionaries (not a recordset). |

!!! warning "Recordsets vs. Dictionaries"
    Unlike `search_read()` (which returns a list of dicts), `search_fetch()` returns a **real Recordset**. This means you can still call methods on the results, but the fields you requested are pre-loaded in the cache.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** `search_fetch()` combines domain filtering and field retrieval into a single SQL query.
*   **Architect Insight:** Use `search_fetch()` in performance-critical loops and UI dashboards to eliminate the "N+1" problem before it starts.
*   **Verify Your Knowledge:** How does `search_fetch()` differ from `search_read()`? (Answer: `search_fetch()` returns a Recordset; `search_read()` returns a list of dictionaries).

!!! success "Next Step"
    Logic in Odoo is reactive. Master [API Decorators](../advanced/decorators.md) to build intelligent models.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
