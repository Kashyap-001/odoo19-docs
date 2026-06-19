---
title: Odoo 19 Performance Profiling & SQL Optimization
description: Learn how to profile Odoo 19 applications using --dev=profile, the UI Profiler, speedscope flamegraphs, raw SQL wrappers, and cache management.
---

# Performance Profiling & SQL Optimization

At scale, database query execution, memory inflation, and CPU blockages are the primary bottlenecks in any Odoo installation. A single slow request can lock worker threads and trigger a cascade of timeouts for all concurrent users. 

As a Senior Architect, you must know how to trace performance issues using Odoo's built-in Profiler, visualize stack traces with Speedscope, execute raw SQL safely, and manually orchestrate the Environment cache.

---

## 1. Enabling the Odoo Profiler

Odoo 19 offers multiple entry points to profile code execution, ranging from developer-mode UI toggles to command-line startup parameters.

### A. Developer UI Profiler
To profile standard web requests directly from your browser:
1. Activate **Developer Mode**.
2. Click the "bug" icon in the top right header.
3. Select **Enable Profiling**. A speedometer icon will appear in the top-bar.
4. Run your target business operations.
5. Click the speedometer icon again, select **Disable Profiling**, and download the generated execution stats file.

*Pro-tip: You can append `?profile=1` to any Odoo URL hash to force profiling for that specific HTTP controller execution.*

### B. Global Request Profiling (`--dev=profile`)
Start Odoo with the `--dev=profile` flag to profile every incoming HTTP request automatically:
```bash
python odoo-bin -c odoo.conf -d my_database --dev=profile
```
*   **Behavior**: When active, Odoo saves execution statistics files inside the Odoo data directory (typically `~/.local/share/Odoo/speedscope/`).
*   **UI Integration**: It also displays the speedometer control in the developer top-bar.

### C. CLI JSON Profiling (`--profile`)
To profile the entire lifecycle of an Odoo session (including server boot, registry loading, and cron executions), launch Odoo with the `--profile` option:
```bash
python odoo-bin --profile -c odoo.conf -d my_database
```
This writes speedscope JSON files to the filesystem upon server termination.

---

## 2. Code-Level Profiling: Decorators & Context Managers

For surgical precision in your custom backend code, you can profile specific methods or isolated execution blocks.

### A. The `@profile` Method Decorator
Decorate any model method to profile its execution every time it is invoked by the ORM:
```python
from odoo.tools.profiler import profile

class AuctionListing(models.Model):
    _inherit = 'auction.listing'

    @profile
    def action_calculate_winners(self):
        # Complex calculation logic here
        pass
```

### B. The `Profiler` Context Manager
Instead of profiling an entire method (which may include standard reads and preparation), use the `Profiler` context manager to analyze an isolated block of code:
```python
from odoo.tools.profiler import Profiler

def process_data(self):
    # Standard setup
    self._validate_records()

    # Profile only the heavy database transaction block
    with Profiler():
        self._execute_heavy_calculations()
```

---

## 3. Visualizing Stack Traces with Speedscope

The profiler outputs execution stats in JSON files compatible with **Speedscope**, a high-performance web-based flamegraph visualizer.

1. Locate the generated profile JSON file.
2. Navigate to [speedscope.app](https://www.speedscope.app/).
3. Drag and drop the JSON file into the browser.

### Key Speedscope Views:
*   **Time Grid (Flamegraph)**: A visualization of call stacks where each box is a function call. The width of a box is proportional to the total time spent in that function (including its children).
*   **Heavy (Bottom-Up)**: Lists individual functions sorted by the time spent *directly* inside them (excluding call chains).
*   **Sandwich (Top-Down)**: Shows caller-callee hierarchies. Ideal for tracking which business method triggered a specific slow ORM method.

---

## 4. Real-time Database Tracing

If your CPU usage is low but execution is slow, the database is bottlenecked. Use these tools to track query counts and performance.

### A. Real-time Query Counting: `self.env.cr.statistics`
You can trace SQL query volume programmatically by checking the database cursor stats:
```python
stats_before = self.env.cr.statistics
self.execute_business_action()
stats_after = self.env.cr.statistics

queries_executed = stats_after['sql_count'] - stats_before['sql_count']
print(f"Total SQL Queries Executed: {queries_executed}")
```
*If `sql_count` grows linearly with the number of records, you have an **N+1 query bug** that needs batch optimization or `search_fetch` preloading.*

### B. SQL Debug Logging (`--log-level=debug_sql`)
Start the Odoo server with SQL logging active to inspect every query in the terminal log stream:
```bash
python odoo-bin -c odoo.conf -d my_database --log-level=debug_sql
```

---

## 5. Cache Management: `flush_model` and `invalidate_recordset`

Odoo maintains an in-memory cache for the duration of a database transaction (`self.env.cache`).
*   **Read**: Reads the cache first before querying Postgres.
*   **Write**: Updates the cache and marks the records "dirty" to be flushed to PostgreSQL later.

When running raw SQL commands alongside ORM calls, Odoo's cache does not automatically sync. You must manage it manually using cache hooks.

```python
# 1. Force the ORM to write pending cache changes to Postgres before running SQL
self.env['auction.listing'].flush_model(['name', 'price'])

# 2. Run raw SQL command directly on the database
self.env.cr.execute(
    "UPDATE auction_listing SET price = price + 100 WHERE id = %s",
    [self.id]
)

# 3. Invalidate the cache to force the next ORM read to query the database
self.invalidate_recordset(['price'])
```

---

## 6. Safe Raw SQL: The Odoo 19 `SQL()` Wrapper

Executing raw SQL using cursor commands can expose your system to **SQL Injection** if parameters are concatenated. Odoo 19 introduces the declarative `SQL()` wrapper to prevent safety exploits while keeping raw queries composable and readable.

> [!IMPORTANT]
> Always wrap raw SQL query parameters using the `odoo.tools.SQL` class rather than formatting strings manually.

```python
from odoo.tools import SQL

def get_high_bids(self, limit):
    # Safe from SQL injection! Parameters are escaped automatically by PostgreSQL
    query = SQL(
        "SELECT id FROM auction_bid WHERE amount > %s LIMIT %s",
        5000, 
        limit
    )
    self.env.cr.execute(query)
    return self.env.cr.fetchall()
```

---

## 🏁 Senior Checkpoint

*   **Key Concept**: Use `--dev=profile` to capture global request patterns and Speedscope flamegraphs to pinpoint the exact functions responsible for performance bottlenecks.
*   **Architect Insight**: When bypassing the ORM for raw SQL, always sequence your transactions: **Flush ORM Cache** -> **Run SQL Wrapper** -> **Invalidate ORM Cache**.
*   **Verify Your Knowledge**: Why should you write raw SQL using `SQL()` instead of `f"SELECT * FROM table WHERE id = {self.id}"`? (Answer: String formatting leaves the code vulnerable to SQL injection. The `SQL()` wrapper sanitizes and parameters-binds the inputs safely).

---

## 💻 Code Challenge

**Complete the code sequence to flush, run a raw query safely, and invalidate the ORM cache:**

<div class="code-challenge">
<pre><code># Flush cache
self.env['auction.bid'].<input type="text" class="quiz-input-inline w-180" data-answer="flush_model(['amount'])">

# Run safe query
query = SQL("UPDATE auction_bid SET amount = 500 WHERE id = %s", self.id)
self.env.cr.execute(query)

# Invalidate cache
self.<input type="text" class="quiz-input-inline w-200" data-answer="invalidate_recordset(['amount'])">
</code></pre>
<button class="quiz-check" onclick="checkCodeChallenge(this)">Check Code</button>
<div class="quiz-result"></div>
</div>
