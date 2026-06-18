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
