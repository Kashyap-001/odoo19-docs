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

## 🏗️ Master Project Challenge: Batch Operations
1.  **Task**: Your system has a process that updates the `price` for 1000 auction listings at once.
2.  **Goal**: Refactor the current loop-based update into a single `listings.write()` call. Measure the difference in log time (if possible).

---

## 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. Why is calling write() inside a loop considered a "Junior Trap"?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="It triggers an ORM call for every single record, causing high database overhead (an 'ORM storm')." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

---

## 3. 🏁 Senior Checkpoint
*   **Architect Insight:** Aim for *zero* ORM calls inside loops. Always push logic outside the loop by batching operations or preparing data structures.
*   **Pro Tip:** Use `env.add_to_compute()` or similar techniques when working with massive computed field updates to further optimize performance.
