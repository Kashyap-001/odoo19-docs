# Performance Profiling & SQL Optimization

Master the art of identifying bottlenecks and squeezing every millisecond of performance out of Odoo 19.

---

## The Odoo 19 Profiler

Odoo 19 comes with a built-in profiler that provides deep insights into the execution time of your methods and the SQL queries they trigger.

### Enabling the Profiler
To enable the profiler in the web interface:
1. Activate **Developer Mode**.
2. Click on the "bug" icon in the top right.
3. Select **Enable Profiling**.

Alternatively, you can enable it for a specific request by adding `?profile=1` to the URL.

### The `profiler` Context Manager
For surgical precision in your backend code, use the `profiler` context manager:

```python
from odoo.tools.profiler import Profiler

def my_heavy_method(self):
    with Profiler():
        # Your code here
        result = self._process_data()
    return result
```

---

## Interpreting Speedscope Flamegraphs

Odoo's profiler generates results that can be exported to **Speedscope**, a high-performance web-based flamegraph visualizer.

### Key Concepts:
*   **Flamegraph:** A visualization of stack traces where each box represents a function. The width of the box represents the total time spent in that function (including its children).
*   **Heavy (Bottom Up):** Identifies which functions are consuming the most time directly.
*   **Sandwich (Top Down):** Shows the caller and callee relationship.

!!! tip "Senior Insight"
    Look for "wide" boxes that don't have many children—these are your "leaf" functions doing actual work and are often the best candidates for optimization.

---

## Common SQL Bottlenecks

Even with Odoo's powerful ORM, inefficient SQL patterns can cripple performance.

### 1. The N+1 Problem
Occurs when you loop over a recordset and access a relational field that hasn't been prefetched.
*   **Symptom:** Hundreds of similar SELECT queries.
*   **Fix:** Use `prefetch_fields` or ensure you are processing recordsets in batch.

### 2. Missing Indexes
*   **Symptom:** Sequential scans on large tables.
*   **Fix:** Add `index=True` to fields used frequently in search domains or as join keys.

### 3. Excessive `search_count()`
*   **Symptom:** Unnecessary overhead just to check for existence.
*   **Fix:** Use `search(limit=1)` if you only need to know if at least one record exists.

---

## ORM Internals: Why Odoo is Fast (or Slow)

To be a Senior Architect, you must understand how the ORM handles data behind the scenes.

### 1. Prefetching: The Anti-N+1 Shield
When you access a field on one record in a recordset (e.g., `self[0].name`), Odoo doesn't just fetch that one field. It automatically fetches that field for **all records** in the current recordset and stores them in the cache.

- **How it works:** Odoo tracks a "prefetch set" for every recordset. 
- **Senior Tip:** If you are processing thousands of records and only need one field, you can disable prefetching to save memory: `records.with_context(prefetch_fields=False)`.

### 2. The Environment Cache (`self.env.cache`)
Odoo maintains an in-memory cache for the duration of a transaction.
- When you read a field, Odoo checks the cache first.
- When you write a field, Odoo updates the cache and marks it "dirty" to be flushed to SQL later.

#### Cache Management Hooks
As a Senior Architect, you must manually manage the cache when mixing ORM calls with raw SQL.
- **`flush_model(fields)`**: Forces the ORM to write pending changes for specific fields from the cache to the database. Essential before running a raw SQL `SELECT`.
- **`invalidate_recordset(fields)`**: Tells the ORM that the data in the database has changed (e.g., via a raw SQL `UPDATE`) and the cache should be cleared so the next read fetches fresh data.

```python
# Force-write name changes to DB so SQL can see them
self.env['auction.listing'].flush_model(['name'])

# Run raw SQL
self.env.cr.execute("UPDATE auction_listing SET name = 'Fixed' WHERE id = %s", [self.id])

# Clear cache so recordset sees the SQL update
self.invalidate_recordset(['name'])
```

### 3. Safe Raw SQL with the `SQL()` Wrapper
Odoo 19 (and backported to late 17/18) introduces the `odoo.tools.SQL` wrapper. It is the new gold standard for writing raw SQL that is safe from injection while being highly readable.

```python
from odoo.tools import SQL

def get_high_bids(self, limit):
    query = SQL(
        "SELECT id FROM auction_bid WHERE amount > %s LIMIT %s",
        5000, limit
    )
    self.env.cr.execute(query)
    return self.env.cr.fetchall()
```
!!! success "Why use SQL()?"
    It prevents accidental SQL injection by automatically handling parameter escaping and allowing you to compose complex queries by nesting `SQL()` objects.

---

### 4. Recordsets vs. Loops
Always prefer **Set Operations** over manual Python loops.
- **Bad:** `[r.id for r in records if r.state == 'open']`
- **Good:** `records.filtered(lambda r: r.state == 'open').ids`
- **Why?** Set operations are implemented in optimized C/Python and better utilize Odoo's prefetching logic.

---

## 💻 Code Challenge: Optimization

Rewrite the following inefficient method using Odoo 19 best practices.

```python
# Inefficient Version
def calculate_totals(self):
    for record in self:
        # This triggers a query for every iteration!
        lines = self.env['auction.bid'].search([('listing_id', '=', record.id)])
        record.total_bids = len(lines)
```

??? tip "Solution"
    ```python
    # Optimized Version using read_group
    def calculate_totals(self):
        # Batch fetch counts for all records in one query
        bid_data = self.env['auction.bid'].read_group(
            [('listing_id', 'in', self.ids)],
            ['listing_id'],
            ['listing_id']
        )
        mapped_data = {d['listing_id'][0]: d['listing_id_count'] for d in bid_data}
        for record in self:
            record.total_bids = mapped_data.get(record.id, 0)
    ```

---

## 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. Which tool does Odoo 19 use to visualize profiling data?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="Speedscope" onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">2. What attribute should you add to a field to improve search performance on large datasets?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="index=True" onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">3. How can you enable profiling for a specific URL request?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="By adding ?profile=1 to the URL." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
