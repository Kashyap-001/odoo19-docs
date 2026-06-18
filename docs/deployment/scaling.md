---
title: Odoo 19 Senior Architecture: High Performance & Production
description: Advanced techniques for scaling Odoo: Database indexing, profiling, worker configuration, and production deployment best practices.
---

# Odoo 19: Senior Architecture

To master Odoo at a senior level, you must understand what happens *outside* the Python code. Scaling, database integrity, and production-ready deployments are what separate junior hacks from senior-level architectural solutions.

---

## 1. PostgreSQL Indexing (`index=True`)
Never allow Odoo to perform full table scans. If a field is frequently used in `search()` domains, index it.

```python
# In your Model
name = fields.Char(index=True)
# Or for combined indexes:
_sql_constraints = [
    ('name_uniq', 'unique(name, company_id)', 'Name must be unique per company!')
]
```

---

## 2. Profiling Performance
If your Odoo instance is slow, **don't guess.** Measure.

*   **Server Profiler:** Start Odoo with `--dev=profile` to identify bottlenecks.
*   **Database:** Use `EXPLAIN ANALYZE` on SQL queries to identify missing indexes.

---

## 3. Scaling: Workers and Longpolling
By default, Odoo runs in a single process. For production, you **must** use multiple workers.

```ini
# odoo.conf
workers = 4
# How many workers per CPU
# Formula: (2 * CPU) + 1
```

*   **Longpolling:** Required for real-time WebSocket communication (Bus/Websocket). Ensure it is configured correctly in `odoo.conf` and Nginx.

---

## 🏗️ Master Project Challenge: Architecture
1.  **Task**: Your `auction.listing` model has high traffic on the `name` field.
2.  **Goal**: Add `index=True` to the `name` field, and calculate the optimal `workers` value for a 4-CPU server.

---

## 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. Why is setting `workers` > 0 essential for production?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="It allows Odoo to handle multiple concurrent requests by using multiple processes, improving performance and responsiveness." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

---

## 🏁 Senior Checkpoint
*   **Architect Insight:** Scaling Odoo is a triangle: Database (Postgres) + Application Server (Workers) + Frontend Proxy (Nginx). All three must be tuned.
*   **Pro Tip:** Use Queue Job (OCA) to offload heavy asynchronous tasks, drastically reducing response times for users.
