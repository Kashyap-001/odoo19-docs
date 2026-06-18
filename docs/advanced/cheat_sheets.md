# Odoo 19 Senior Cheat Sheets

A high-density reference for professional Odoo 19 development. Bookmark this page for quick access to core syntax and patterns.

---

## 🛠️ Relational Commands (`odoo.Command`)
Use the `Command` class for clean, readable relational operations in `create()` and `write()`.

| Method | Legacy Tuple | Action |
| :--- | :--- | :--- |
| **`Command.create({vals})`** | `(0, 0, {vals})` | Create a new child record. |
| **`Command.update(id, {vals})`** | `(1, id, {vals})` | Update an existing child record. |
| **`Command.delete(id)`** | `(2, id, 0)` | **Delete** and unlink child record. |
| **`Command.unlink(id)`** | `(3, id, 0)` | **Unlink** (remove relationship) only. |
| **`Command.link(id)`** | `(4, id, 0)` | Link an existing record. |
| **`Command.clear()`** | `(5, 0, 0)` | Unlink all records. |
| **`Command.set([ids])`** | `(6, 0, [ids])` | Replace all links with this list. |

---

## 🧩 XPath Navigation Patterns
Surgical view modification patterns.

| Goal | Expression | Position |
| :--- | :--- | :--- |
| **Add after field** | `//field[@name='field_name']` | `after` |
| **Modify attribute** | `//field[@name='field_name']` | `attributes` |
| **Wrap in group** | `//field[@name='field_name']` | `replace` (with target inside) |
| **Inside notebook** | `//notebook/page[@name='page_name']` | `inside` |
| **Add to header** | `//header` | `inside` |

!!! tip "Direct Paths"
    Avoid `//` (deep search) in complex views for better performance:
    `/form/sheet/notebook/page[@name='public_information']/group/field[@name='type']`

---

## 🧠 Core API Decorators
Defining the reactivity of your business logic.

| Decorator | Use Case | Triggers |
| :--- | :--- | :--- |
| **`@api.depends('f1', 'f2')`** | Computed Fields | When f1 or f2 changes (DB). |
| **`@api.constrains('f1')`** | Server Validation | On create/write (DB). |
| **`@api.onchange('f1')`** | UI Feedback | When f1 changes in Form (UI). |
| **`@api.model`** | Class Method | Called on the model, not records. |
| **`@api.model_create_multi`** | Batch Creation | Mandatory for overriding `create()`. |

---

## 🏗️ Model Attributes Cheat Sheet
Configuring model behavior.

| Attribute | Purpose | Standard Example |
| :--- | :--- | :--- |
| **`_name`** | Unique Identifier | `auction.listing` |
| **`_inherit`** | Extension | `['mail.thread', 'mail.activity.mixin']` |
| **`_description`** | Human Title | `Auction Listing` |
| **`_order`** | Sorting | `id desc` |
| **`_rec_name`** | Display Field | `name` |

---

## 🌐 Modern Frontend (OWL 2.0)
Essential hooks for reactive components.

| Hook | Purpose |
| :--- | :--- |
| **`useState(obj)`** | Creates reactive local state. |
| **`useService(name)`** | Injects a shared Odoo service (rpc, orm, etc). |
| **`onWillStart(fn)`** | Lifecycle: Runs before component starts. |
| **`onMounted(fn)`** | Lifecycle: Runs after DOM attachment. |
| **`reactive(obj)`** | Creates a tracked proxy object (for Stores). |

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
