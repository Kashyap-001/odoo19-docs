# Odoo 19 Migration Cheat Sheet

Use this guide to quickly update your modules from Odoo 18 to Odoo 19.

---

## 🏗️ Configuration & Environment
| Feature | Odoo 18 | Odoo 19 (Modern) |
| :--- | :--- | :--- |
| **Python Version** | 3.10 | **3.12** (Recommended) |
| **Server Port** | `xmlrpc_port` | **`http_port`** |
| **Longpolling Port** | `chat_port` | **`gevent_port`** |

---

## 🧠 ORM & Python Changes
| Feature | Odoo 18 | Odoo 19 (Modern) |
| :--- | :--- | :--- |
| **Model Name** | `_name` required | **Optional** (Auto-derived from ClassName) |
| **Constraints** | `_sql_constraints = []` | **`_name = models.Constraint()`** |
| **Indexes** | `index=True` | **`_name = models.Index()`** |
| **Domains** | `('child_ids', '=', False)` | **`('child_ids', 'not any!', [])`** (Faster) |
| **O2M Search** | `('child_ids', '!=', False)` | **`('child_ids', 'any!', [])`** |
| **Decorators** | `@api.returns` | **REMOVED** (Use type hints) |

---

## 🎨 Views & XML Changes
| Feature | Odoo 18 | Odoo 19 (Modern) |
| :--- | :--- | :--- |
| **List View** | `<tree>` | **`<list>`** |
| **Kanban Card** | `<t t-name="kanban-box">` | **`<card>`** |
| **QWeb Output** | `<span t-esc="..."/>` | **`<span t-out="..."/>`** |
| **View Overrides** | `mode="primary"` | **`mode="inner"`** (Surgical replace) |
| **Template Extension** | Standard `<xpath>` | **`inheritance_mode="inner"`** (Root only) |

---

## 🌐 JavaScript (OWL) Changes
| Feature | Odoo 18 | Odoo 19 (Modern) |
| :--- | :--- | :--- |
| **Inheritance** | `Class.include({})` | **DELETED** (Use `patch`) |
| **Patching** | `@web/core/utils/patch` | **Strict `super.setup()` required** |
| **UI Shell** | Top Menu | **Collapsible Sidebar** |
| **Registry** | `category("views")` | **Standardized categories** |

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
