---
title: Odoo 19 UI Display Tutorial — Customizing display_name & name_get
description: Learn how to customize how records are displayed in Many2one dropdowns and breadcrumbs by overriding display_name in Odoo 19.
---

# Odoo 19 UI Display Customization

In Odoo, every record has a "Display Name" used in Many2one fields, Breadcrumbs, and Search results. In newer versions of Odoo (including Odoo 19), this is handled by a special computed field called `display_name`.

## The _compute_display_name Method
To customize how a record's name appears to the user, you should override the `_compute_display_name()` method. This replaces the older `name_get()` method.

### Basic Customization
By default, Odoo uses the field named `name`. If you want to show something else, like a combination of fields, use the example below.

```python
from odoo import models, fields

class Student(models.Model):
    _name = 'school.student'

    first_name = fields.Char()
    last_name = fields.Char()
    roll_number = fields.Integer()

    def _compute_display_name(self):
        for record in self:
            record.display_name = f"[{record.roll_number}] {record.first_name} {record.last_name}"
```

In the UI, this record will appear as: **[101] John Doe**

---

## Odoo 19: The Sidebar Navigation Paradigm
Odoo 19 introduces a fundamental shift in user navigation by replacing the traditional **Top Menu** with a **Collapsible Sidebar**. As a senior developer, this affects how you design your app's entry points and information architecture.

### 1. Architectural Impact
- **Persistent Visibility**: Key menus are now always visible on the left, reducing the number of clicks needed to switch between main functions.
- **Favorites & Pinning**: Users can now pin specific menus or even specific records to the top of their sidebar. Your app should prioritize naming records clearly to make "Pinned" items useful.
- **Horizontal Space**: With the sidebar on the left, your views have slightly less horizontal space but more vertical continuity. Use the Odoo 19 `<list>` and `<card>` elements which are optimized for this aspect ratio.

### 2. Information Hierarchy
In Odoo 19, the breadcrumbs have moved to the top-left, integrated into the header next to the sidebar toggle. 

!!! tip "Senior Architect Tip: Contextual Menus"
    Since the sidebar is global, avoid deeply nested menus. Odoo 19 favors "Flat" navigation. Use **Secondary Sidebar Menus** (visible when an app is active) to group sub-functions like "Settings," "Reporting," and "Configuration."

---

## Changing the Default Field (_rec_name)
If you just want Odoo to use a different field (instead of `name`) as the display name without writing a function, you can use the `_rec_name` attribute.

```python
class Project(models.Model):
    _name = 'my.project'
    _rec_name = 'title'  # Use 'title' field as the display name

    title = fields.Char()
    description = fields.Text()
```

---

## Customizing Dropdown Search (`_name_search`)

While `_compute_display_name` controls what the user **sees**, the `_name_search()` method controls how the user **finds** a record. When you type into a `Many2one` field, Odoo calls this method to generate the list of results.

### When to override?
By default, Odoo only searches the `_rec_name` field (usually `name`). Override this if you want users to find records by other criteria, such as:
- Internal Reference / Code
- Phone Number or Email
- Related Parent Name

### Example: Searching by Code or Name
In the **Auction Marketplace**, we want users to find auctions by typing their unique reference (e.g., `AUC/001`) OR their title.

```python
@api.model
def _name_search(self, name, domain=None, operator='ilike', limit=100, order=None):
    domain = domain or []
    if name:
        # Search by title OR internal reference
        name_domain = ['|', ('name', operator, name), ('reference', operator, name)]
        if operator in expression.NEGATIVE_TERM_OPERATORS:
            name_domain = ['&', ('name', operator, name), ('reference', operator, name)]
        domain = expression.AND([domain, name_domain])
    return self._search(domain, limit=limit, order=order)
```

!!! info "Note on _name_search vs name_search"
    In Odoo 19, `_name_search` (with underscore) is the primary entry point for customizing autocomplete logic. It returns a recordset or a domain image, making it more efficient than the older `name_search` which returned a list of tuples.

---

## Customizing Defaults (`default_get`)

The `default_get()` method is called when a user clicks the "New" button but before the form is displayed. It returns the initial values for the fields.

### When to override?
Use `default_get()` for complex defaults that can't be set with a static `default=` parameter, such as:
- Pulling values from the `context`.
- Logic based on the current user's profile.
- Calculations involving the current date/time.

### Example: Setting Dynamic Defaults
```python
@api.model
def default_get(self, fields_list):
    res = super().default_get(fields_list)
    # Automatically set the 'start_date' to tomorrow if not provided
    if 'start_date' in fields_list:
        res['start_date'] = fields.Date.today() + timedelta(days=1)
    return res
```

---

## Why use _compute_display_name?

| Advantage | Description |
| :--- | :--- |
| **Performance** | It behaves like a standard computed field, allowing for efficient caching. |
| **Flexibility** | You can include relational data or logic (e.g., showing "Draft" for new records). |
| **Consistency** | It provides a single point of truth for how a record is identified across the system. |

### Advanced Example with Logic
```python
def _compute_display_name(self):
    for record in self:
        name = record.name
        if record.state == 'draft':
            name = f"{name} (Draft)"
        record.display_name = name
```

> **Pro Tip:** When overriding `_compute_display_name`, ensure it is fast and handles empty fields gracefully to avoid UI lag.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** `display_name` is a standard computed field in Odoo 19, replacing the old `name_get()` logic.
*   **Architect Insight:** Overriding `_compute_display_name` allows you to create dynamic, data-rich labels that improve user navigation without adding extra fields.
*   **Verify Your Knowledge:** What happens if you don't define `_rec_name` or `_compute_display_name`? (Answer: Odoo looks for a field named `name` by default).

!!! success "Next Step"
    Now that the UI looks good, let's connect Odoo to the world in [Phase 7: External Integration](../integration/controllers.md).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
