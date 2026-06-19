---
title: Odoo 19 Context and with_context()
description: Master the Odoo Context dictionary. Learn how to pass data between methods, use with_context(), and leverage environment helpers.
---

# Odoo 19 Context: Metadata & Execution Modification

The **Context** is a python dictionary containing shared metadata such as the active user's timezone, language, active company, and custom execution flags.

---

## 1. What is it
The Odoo Context is a key-value dictionary attached to the environment (`self.env.context`). It carries localization settings and system flags down the execution callstack. Importantly, the context dictionary is **immutable**; changes are applied by cloning the environment using the `with_context()` method.

---

## 2. Why
Modern ERP applications execute deep callstacks. Passing metadata (like language or active timezone) through every intermediate method signature is impractical. The Context acts as a "backpack" that is automatically carried by Odoo’s ORM throughout the transaction.

---

## 3. When
*   Use to set default values for record creation (`default_<field_name>`).
*   Use to bypass standard active filters (`active_test=False`) to retrieve archived records.
*   Use to override language codes (`lang='fr_FR'`) to force translations on invoices or emails.
*   Use to suppress automated logs (`tracking_disable=True`) during bulk data migration.

---

## 4. When Not
*   **Do not** attempt to mutate the context dictionary directly (e.g. `self.env.context['key'] = value`). It will raise a TypeError.
*   **Do not** use the context to pass mandatory business parameters that should be explicit method arguments. Doing so obscures the API design and makes debugging difficult.

---

## 5. Syntax
Here is the core Python syntax for interacting with the Context:

```python
# 1. Reading values from the context
user_lang = self.env.context.get('lang')  # Returns language code (e.g. 'en_US')
active_id = self.env.context.get('active_id')  # Returns current record ID from UI

# 2. Cloning the environment with context modifiers
# (Does not alter 'self', returns a new recordset pointing to modified env)
modified_recordset = self.with_context(active_test=False)

# 3. Injecting multiple key-values
custom_env = self.with_context(
    lang='fr_FR',
    default_user_id=self.env.user.id,
    custom_flag=True
)
```

---

## 6. Examples

### A. Context Key overrides & Bypasses
```python
# Find all products, including archived ones
all_products = self.env['product.product'].with_context(active_test=False).search([])

# Force-translate a description into French for a dynamic email template
french_listing = self.with_context(lang='fr_FR')
email_body = french_listing.description
```

### B. Master Project Challenge: Dynamic Email Bypass Flag
1.  **Task**: Add a flag `is_automated_process` to the context when creating an `auction.listing` from a scheduled action.
2.  **Goal**: In your `create()` method, check this flag and skip the "Congratulations Email" if the flag is `True`.

```python
from odoo import models, fields, api

class AuctionListing(models.Model):
    _name = 'auction.listing'
    _description = 'Auction Listing'

    name = fields.Char("Title")
    state = fields.Selection([('draft', 'Draft'), ('open', 'Open')], default='draft')

    @api.model_create_multi
    def create(self, vals_list):
        records = super().create(vals_list)
        
        # Check context for automation flag
        if not self.env.context.get('is_automated_process'):
            for record in records:
                record._send_congratulations_email()
                
        return records

    def _send_congratulations_email(self):
        # Email transmission logic
        pass

# Triggering code from scheduled cron script:
# listing_model = self.env['auction.listing'].with_context(is_automated_process=True)
# listing_model.create([{'name': 'Automated Import Item'}])
```

### 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. Is the Odoo Context mutable (can it be changed directly)?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="No, the Odoo context is immutable. You must use with_context() to create a new recordset with an updated context." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

---

## 7. Common Mistakes
1.  **Direct Mutation Attempts**: Writing code like `self.env.context['my_key'] = True`. The dictionary is a read-only mapping and will raise a runtime exception.
2.  **Discarding the Returned Recordset**: Calling `self.with_context(key=val)` as a standalone line without capturing the result. Always capture it: `self = self.with_context(...)` or `records = records.with_context(...)`.
3.  **Default Value Overrides Colliding**: Setting `default_partner_id` in the context, forgetting that it will propagate and populate fields in any sub-records or line items created during that execution block.

---

## 8. Performance
During bulk imports of thousands of records, Odoo will trigger Chatter tracking logs (`tracking=True`) for every modified field. This results in heavy SQL insert operations and slows down imports.
*   **The `tracking_disable` Pattern**: Use `with_context(tracking_disable=True)` to temporarily disable chatter tracking and dramatically increase import speed.

```python
@api.model_create_multi
def import_bids(self, vals_list):
    # Disable Chatter tracking for this transaction to optimize write times
    env_fast = self.with_context(tracking_disable=True)
    return env_fast.create(vals_list)
```

---

## 9. Senior
In Odoo 19:
*   **Cache Splitting**: If a computed field depends on context keys, you must declare it using the `@api.depends_context` decorator. This ensures Odoo partitions the recordset cache per context value, preventing a user in French (`lang='fr_FR'`) from reading translated fields cached by an English user (`lang='en_US'`).
```python
@api.depends('name')
@api.depends_context('lang', 'company')
def _compute_display_name(self):
    ...
```

---

## 10. Diagrams

This diagram shows how `with_context()` clones the environment context, establishing a separate, immutable metadata execution branch while leaving the original recordset environment intact:

```mermaid
graph TD
    subgraph "Original Context Path"
        R1[Recordset: self] -->|env| Env1[self.env]
        Env1 -->|context| Ctx1[Context: lang, tz]
    end

    subgraph "Modified Context Path"
        R1 -->|with_context(active_test=False)| R2[New Recordset]
        R2 -->|env (cloned)| Env2[New Environment]
        Env2 -->|context (merged)| Ctx2["Context: lang, tz, active_test=False"]
    end
```

---

## 11. Related
*   [Environment Deep Dive](env_deep_dive.md)
*   [Recordset Helpers](recordset_helpers.md)
*   [Decorators (@api)](../advanced/decorators.md)
