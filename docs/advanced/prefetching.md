---
title: Odoo 19 ORM Prefetching Mechanism
description: Understand how Odoo automatically prefetches data to optimize SQL performance. Learn how to control and leverage prefetching for senior-level development.
---

# Odoo 19: ORM Prefetching

Have you ever wondered why accessing `record.partner_id.name` in a loop of 1000 records doesn't cause 1000 SQL queries? The answer is **Prefetching**.

---

## 💡 The Concept: "Batch Loading"

Odoo is designed to be lazy. When you fetch a recordset, Odoo doesn't load all the fields for all the records immediately.

However, when you access a relational field (like `partner_id`) on *one* record in a recordset, Odoo assumes you will likely need that same field for the *other* records in that same recordset.

**It prefetches the data for all records in the recordset in one single SQL query.**

---

## 🏗️ How it Works

Imagine you have 100 auction listings and you loop through them to get the partner name:

```python
# 1. Fetch listings
listings = self.env['auction.listing'].search([('state', '=', 'active')])

# 2. Access partner_id.name
for listing in listings:
    # Odoo fetches partner_id for ALL 100 listings
    # in the very first iteration.
    print(listing.partner_id.name)
```

Without prefetching, this would trigger 100 queries for the partner name. With prefetching, Odoo intelligently bundles them.

---

## ⚠️ The "Breaking" the Prefetch Trap

As a Senior Developer, you must know what breaks this optimization.

### ❌ Breaking the Prefetch
If you process records *individually* rather than as a recordset, prefetching breaks.

```python
for listing_id in listings.ids:
    # We are now working with an integer ID, not a recordset!
    # Odoo cannot prefetch across different recordsets.
    listing = self.env['auction.listing'].browse(listing_id)
    print(listing.partner_id.name) # Triggers SQL every time!
```

---

## 🏗️ Master Project Challenge: Prefetching
1.  **Task**: Your dashboard currently fetches auction listings one by one.
2.  **Goal**: Refactor the fetch logic to use a single `search()` call, allowing Odoo to automatically prefetch related `owner_id` fields.

---

## 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. What is the main benefit of Odoo's prefetching mechanism?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="It bundles multiple SQL queries into one, drastically reducing database overhead when accessing related records in a loop." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

---

## 🏁 Senior Checkpoint
*   **Architect Insight:** Always operate on recordsets, not individual IDs, to allow Odoo to optimize SQL via prefetching.
*   **Pro Tip:** If you notice slow performance in a loop, verify if you are accidentally breaking the prefetch mechanism by converting to IDs prematurely.
