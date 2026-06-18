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
