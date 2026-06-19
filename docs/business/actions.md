---
title: Odoo 19 Actions & Automation Tutorial — Window, Server, and Client Actions
description: Complete guide to Odoo 19 action types. Configure window actions, server actions, automated actions, and client tag references.
---

# Odoo 19 Actions & Menus

Actions define what happens when a user clicks a button or a menu item. They are the glue between the UI and the business logic.

---

## 0. The Beginner's Flow: Linking it All Together

Before diving into complex actions, every beginner must understand the **Trinity of Navigation**. To see your module in Odoo, you must link four technical layers in this exact order:

```mermaid
graph TD
    Model[1. Python Model] --> Views[2. XML Views]
    Views --> Action[3. Window Action]
    Action --> Menu[4. Menu Item]
    
    style Action fill:#f9f,stroke:#333,stroke-width:2px
    style Menu fill:#bbf,stroke:#333,stroke-width:2px
```

### The Recipe for Visibility
1.  **Define the Model**: The data structure (e.g., `auction.listing`).
2.  **Define the View**: How the data looks (e.g., `<list>` or `<form>`).
3.  **Define the Window Action**: The "Command" to open that model with specific views.
4.  **Define the Menu Item**: The "Shortcut" on the dashboard that triggers the Action.

!!! example "Complete Senior Linkage Example"
    ```xml
    <!-- 1. The Action: Defines HOW to open the model -->
    <record id="action_auction_listing" model="ir.actions.act_window">
        <field name="name">Auctions</field>
        <field name="res_model">auction.listing</field>
        <field name="view_mode">list,form,kanban</field>
        <field name="target">current</field>
        <field name="help" type="html">
            <p class="o_view_nocontent_smiling_face">Create your first auction!</p>
        </field>
    </record>

    <!-- 2. The Menus: Hierarchical triggers -->
    <!-- Top Bar (Root) Menu -->
    <menuitem id="menu_auction_root" 
              name="Auction App" 
              web_icon="pways_auction,static/description/icon.png"
              sequence="10"/>

    <!-- Sidebar / Category Menu -->
    <menuitem id="menu_auction_content" 
              name="Listings" 
              parent="menu_auction_root" 
              sequence="10"/>

    <!-- Leaf Menu: The actual clickable button -->
    <menuitem id="menu_auction_listing" 
              name="All Items" 
              parent="menu_auction_content" 
              action="action_auction_listing" 
              sequence="10"/>
    ```

### Key Menuitem Attributes
- **`web_icon`**: Defines the icon shown on the Odoo Dashboard (format: `module,path_to_icon`).
- **`sequence`**: Lower numbers appear first (left-to-right or top-to-bottom).
- **`parent`**: Establishes the hierarchy. If omitted, it becomes a top-level "App".

---

## 1. Window Actions

Window Actions (`ir.actions.act_window`) tell Odoo to open a specific model in the UI.

### Key Attributes
| Attribute | Description | Example |
| :--- | :--- | :--- |
| **`res_model`** | The technical name of the model to open. | `auction.listing` |
| **`view_mode`** | Comma-separated list of views (e.g., `list,form`). | `kanban,list,form` |
| **`domain`** | A filter applied to the records shown. | `[('state', '=', 'open')]` |
| **`context`** | Default values or flags for the view. | `{'default_state': 'draft'}` |
| **`target`** | Where to open: `current`, `new` (popup), `main`. | `current` |

### Returning Actions from Python
Senior developers often return actions from Python methods to guide the user (e.g., opening a specific bid after clicking a button).

```python
def action_view_bids(self):
    return {
        'name': 'Bids for ' + self.name,
        'type': 'ir.actions.act_window',
        'res_model': 'auction.bid',
        'view_mode': 'list,form',
        'domain': [('listing_id', '=', self.id)],
        'target': 'current',
    }
```

---

## 2. Menuitems (`ir.ui.menu`)

Menuitems are the hierarchical navigation links. They connect the user's click to an Action.

!!! info "Technical Note"
    The `<menuitem>` XML tag is a convenient shortcut. Under the hood, Odoo creates and manages records in the **`ir.ui.menu`** model (the `ir_ui_menu` table in PostgreSQL).

```xml
<!-- Top-level App Menu -->
<menuitem id="menu_auction_root" name="Auctions" sequence="10" groups="group_auction_user"/>

<!-- Category Menu -->
<menuitem id="menu_auction_content" name="Content" parent="menu_auction_root" sequence="10"/>

<!-- Leaf Menu (The one you click) -->
<menuitem id="menu_auction_listing" 
          name="Listings" 
          parent="menu_auction_content" 
          action="action_auction_listing" 
          sequence="10"/>
```

---

## 3. Server Actions & AI Logic

Server Actions (`ir.actions.server`) allow you to execute Python code or update multiple records at once.

### AI-Powered Server Actions (New in v19)
Odoo 19 allows using **Natural Language** to define logic.

```xml
<record id="action_ai_moderate_listing" model="ir.actions.server">
    <field name="name">AI Moderate</field>
    <field name="model_id" ref="model_auction_listing"/>
    <field name="state">code</field>
    <field name="code">
# PROMPT: If the listing description contains suspicious keywords, 
# set the state to 'halted' and notify the manager.
    </field>
</record>
```

---

## 4. Contextual & Batch Actions

### The `binding_model_id` Hook
If you want an action to appear in the "Action" menu at the top of a List view, you must set the `binding_model_id`.

```xml
<record id="action_server_approve_auctions" model="ir.actions.server">
    <field name="name">Approve Listings</field>
    <field name="model_id" ref="model_auction_listing"/>
    <field name="binding_model_id" ref="model_auction_listing"/> <!-- Contextual Hook -->
    <field name="state">code</field>
    <field name="code">
        records.action_approve()
    </field>
</record>
```

### `ir.actions.act_window_close`
This action is used in wizards to close the dialog window after the user clicks "Save" or "Cancel".
```python
return {'type': 'ir.actions.act_window_close'}
```

---

## 5. Senior: AI Automation & Architecture

### The `AI_CONTEXT` Object
When using Odoo 19's AI server actions, the framework provides an `AI_CONTEXT` object. This contains metadata about the user and record history to help the LLM make better decisions.

### Prompt Engineering for Logic
**Optimized Prompt:**
```python
# CONTEXT: You are a professional auction moderator.
# DATA: Record values are in 'records'.
# INSTRUCTION: If 'records.description' contains non-English text, set 'state' to 'needs_review'.
```

!!! tip "Architect Tip: Target Selection"
    Use `target='new'` for wizards and small configuration forms. Use `target='current'` for main data entry to avoid "Window Inception" (popups inside popups).

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Actions glue the UI to logic; Menus are the triggers.
*   **Architect Insight:** `binding_model_id` is the standard way to add bulk operations to List views without modifying the original view XML.
*   **Verify Your Knowledge:** What does `target='new'` do? (Answer: Opens the action in a modal/popup window).

!!! success "Next Step"
    Automation is great. Now ensure data integrity with [Constraints & Indexes](../advanced/constraints_indexes.md).


---

## Summary Checklist
1. **Define the Model** in Python.
2. **Create the View** (XML).
3. **Define the Window Action** (XML).
4. **Link the Action to a Menuitem** (XML).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
