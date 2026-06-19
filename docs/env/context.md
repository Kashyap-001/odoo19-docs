---
title: Odoo 19 Context and with_context()
description: Master the Odoo Context dictionary. Learn how to pass data between methods, use with_context(), and leverage environment helpers.
---

# Odoo 19 Context and with_context()

The **Context** is a python dictionary containing shared data such as the user's timezone, language, and custom flags. 

### 💡 Analogy: The Developer's Backpack
Think of the Context as a **Backpack** that Odoo carries through every function, from the UI down to the database.

*   **Standard Tools**: Inside the backpack are tools everyone needs: the current user's language (`lang`), their timezone (`tz`), and their active company.
*   **Custom Flags**: You can slip a **Note** into the backpack (e.g., `{'skip_validation': True}`) at the start of a function. Every subsequent function that Odoo calls can "open the backpack" and see your note to change its behavior.
*   **with_context()**: This is like **swapping backpacks** for a specific mission. You give Odoo a new backpack with different tools, but once the mission is over, Odoo goes back to using the original one.

---

## 2. Core Context Key Catalogue

Odoo reserves several context keys for system-wide behaviors. As an architect, you must know how to leverage these flags:

### A. Prefills: `default_<field_name>`
Any context key starting with `default_` will automatically be loaded by Odoo as the default value for the field matching that name during record creation or form pre-filling.
```python
# Open a wizard with the current partner automatically selected
action_context = {'default_partner_id': self.partner_id.id}
```

### B. Bypassing Inactive Filters: `active_test`
By default, the ORM filters out archived records (records where `active = False`). If you need to search, read, or link archived records, you must set `active_test=False` in the context.
```python
# Find all products, including archived ones
all_products = self.env['product.product'].with_context(active_test=False).search([])
```

### C. Translation & Localization: `lang`
The `lang` key contains the language code of the active user session (e.g. `en_US` or `fr_FR`). This controls which translation strings are loaded from database translation catalogs.
```python
# Force-translate a description into French for a dynamic email template
french_listing = self.with_context(lang='fr_FR')
email_body = french_listing.description
```

### D. Timezone Calculations: `tz`
The `tz` key stores the user's active timezone name (e.g. `America/New_York` or `Europe/Paris`). Odoo stores all Datetime values in UTC in the PostgreSQL database. When displaying timestamps in the UI or printing reports, Odoo looks at `tz` to convert UTC to the user's local time.
```python
# Convert UTC database datetime to user's local timezone manually if needed
user_tz = self.env.context.get('tz') or 'UTC'
```

---

## 🏗️ Master Project Challenge: The Context
1.  **Task**: Add a flag `is_automated_process` to the context when creating an `auction.listing` from a scheduled action.
2.  **Goal**: In your `create()` method, check this flag and skip the "Congratulations Email" if the flag is `True`.

---

## 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. Is the Odoo Context mutable (can it be changed directly)?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="No, the Odoo context is immutable. You must use with_context() to create a new recordset with an updated context." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

---

## 3. Senior: High-Performance Imports

When importing thousands of records (like bulk auction bids), Odoo will try to post a log message to the Chatter for every single field change if `tracking=True` is enabled. This can crash the system.

### The `tracking_disable` Pattern
Senior architects always disable tracking during bulk imports to save massive amounts of SQL `INSERT` time.

```python
@api.model_create_multi
def import_bids(self, vals_list):
    # Disable Chatter tracking for this transaction
    env_fast = self.with_context(tracking_disable=True)
    return env_fast.create(vals_list)
```

---

## 🏁 Senior Checkpoint
*   **Key Concept:** The Context is a dictionary passed through the Environment to share metadata (lang, tz) and custom flags.
*   **Architect Insight:** Context is **immutable**; `with_context()` returns a new recordset. Always capture the result!
*   **Pro Tip:** Use `with_context(tracking_disable=True)` when executing bulk scripts or imports to bypass expensive Chatter logging and optimize database write speed.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
