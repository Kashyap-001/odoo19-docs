# Performance Profiling in Odoo

Odoo 19 includes sophisticated tools to identify slow queries, heavy methods, and N+1 bottlenecks. As a Senior Architect, profiling is your first step before any refactoring.

## Using the Odoo Profiler

The built-in profiler can be triggered via the UI or the CLI.

### Dev Mode Profiling (`--dev=profile`)
Starting Odoo with the `--dev=profile` flag enables automatic request profiling globally.

```bash
python odoo-bin -c odoo.conf -d my_database --dev=profile
```
*   **Behavior**: When active, Odoo profiles every HTTP request. When the request finishes, it saves the execution statistics file under a `speedscope` folder inside your Odoo data directory (e.g., `~/.local/share/Odoo/speedscope/`).
*   **UI Trigger**: It also injects a profiling icon (the "speedometer") in the developer top-bar in the web interface, letting you easily start/stop tracing.

### CLI JSON Profiling (`--profile`)
Run Odoo with the `--profile` flag to save speedscope JSON performance files for the entire boot and run session:
```bash
python odoo-bin --profile -c odoo.conf -d my_db
```

### Code-Level Profiling
You can profile specific methods using the `profile` decorator.

```python
from odoo.tools.profiler import profile

class AuctionListing(models.Model):
    _inherit = 'auction.listing'

    @profile
    def action_calculate_winners(self):
        # Your complex logic here
        pass
```

!!! tip "Architect Tip: SQL Logging"
    If the profiler shows slow execution but low CPU usage, you likely have a database bottleneck. Use `--log-level=debug_sql` to see every query Odoo executes and look for duplicate queries (N+1 problem).

## Identifying Bottlenecks

### 1. The N+1 Query Problem
The most common performance killer. It occurs when you loop over a recordset and access a relational field in each iteration.

**Bad Code:**
```python
for listing in listings:
    print(listing.seller_id.name) # Triggers a query for every listing
```

**Good Code:**
```python
# Prefetching handles this automatically in most cases, 
# but for complex logic, use .read() or .mapped()
seller_names = listings.mapped('seller_id.name')
```

### 2. Cache Invalidation
Heavy writes can invalidate the Odoo cache, forcing subsequent reads to hit the database. 
*   **Strategy:** Group `write()` calls into a single call whenever possible.

## Analyzing the Report

Odoo 19 supports **Speedscope**, a high-performance web-based flamegraph visualizer.

1.  Capture the profile output.
2.  Open [speedscope.app](https://www.speedscope.app/).
3.  Drop your JSON file to see the execution stack.

!!! tip "Architect Tip: Memory Profiling"
    For memory leaks, use the `tracemalloc` library or the `psutil` integration in Odoo. Large imports should be processed in batches using `cr.commit()` every ~1000 records to keep the memory footprint stable.

---

## Senior: Real-time Performance Debugging

### 1. `self.env.cr.statistics`
In Odoo 19, you can inspect the current cursor's statistics to see exactly how many SQL commands have been sent during the current request.

```python
stats_before = self.env.cr.statistics
# ... your code ...
stats_after = self.env.cr.statistics
print(f"Queries executed: {stats_after['sql_count'] - stats_before['sql_count']}")
```

### 2. The Profiler Context Manager
Instead of the `@profile` decorator (which profiles the whole method), use the context manager for "surgical" profiling of a specific block of code.

```python
from odoo.tools.profiler import Profiler

with Profiler():
    # Only this block will be profiled
    self._process_heavy_data()
```

!!! success "Architect Tip: The 'N+1' Detector"
    If your `sql_count` increases linearly with the number of records you are processing, you have an N+1 bug. Use `search_fetch()` to pre-load the necessary fields and flatten the query count.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Profiling identifies execution bottlenecks using speedscope or raw SQL logs.
*   **Architect Insight:** `self.env.cr.statistics` is your best friend for real-time debugging of SQL-heavy methods.
*   **Verify Your Knowledge:** What is a Flamegraph? (Answer: A visual representation of call stacks that shows which methods are consuming the most time).

!!! success "Next Step"
    Course Complete! Review your [Progress Dashboard](../dashboard.md) to claim your Senior Architect title.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
