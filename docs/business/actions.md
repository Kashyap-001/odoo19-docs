# Odoo 19 Actions & Menus

Actions define what happens when a user clicks a button or a menu item. They are the glue between the UI and the business logic.

---

## 1. Window Actions

Window Actions (`ir.actions.act_window`) tell Odoo to open a specific view (Form, List, etc.) for a specific model.

### Example: Open Auction Listings
```xml
<record id="action_auction_listing" model="ir.actions.act_window">
    <field name="name">Auctions</field>
    <field name="res_model">auction.listing</field>
    <field name="view_mode">list,form,kanban</field>
</record>
```

---

## 2. Menuitems

Menuitems are the hierarchical navigation links in the Odoo backend.

```xml
<menuitem id="menu_auction_root" name="Auctions" sequence="10"/>
<menuitem id="menu_auction_listing" name="Listings" parent="menu_auction_root" action="action_auction_listing" sequence="10"/>
```

---

## 3. Server Actions

Server Actions (`ir.actions.server`) allow you to execute Python code or update multiple records at once.

### AI-Powered Server Actions (New in v19)
One of the most revolutionary features of Odoo 19 is the ability to use **Natural Language** to define server action logic. Instead of writing complex Python, you can now provide a prompt.

### Example: Auto-Moderation AI
```xml
<record id="action_ai_moderate_listing" model="ir.actions.server">
    <field name="name">AI Moderate</field>
    <field name="model_id" ref="model_auction_listing"/>
    <field name="state">code</field>
    <field name="code">
# PROMPT: If the listing description contains suspicious keywords or links, 
# set the state to 'halted' and notify the manager.
# Odoo's AI engine will translate this intent into logic at runtime.
    </field>
</record>
```

!!! info "How it Works"
    Odoo 19 integrates with internal LLMs to interpret natural language instructions within the `code` block if specific headers are present. This allows non-developers to create sophisticated business rules without writing a single line of traditional code.

---

4. **Batch Actions**
If you set `binding_model_id`, your action will appear in the "Action" menu at the top of a list view, allowing users to run it on multiple selected records.

```xml
<record id="action_server_approve_auctions" model="ir.actions.server">
    <field name="name">Approve Listings</field>
    <field name="model_id" ref="model_auction_listing"/>
    <field name="binding_model_id" ref="model_auction_listing"/>
    <field name="state">code</field>
    <field name="code">
        records.action_approve()
    </field>
</record>
```

---

## Senior: AI Automation & Prompt Engineering

### 1. The `AI_CONTEXT` Object
When using Odoo 19's AI server actions, the framework provides an `AI_CONTEXT` object. This contains metadata about the user, the record history, and the surrounding business environment to help the LLM make better decisions.

### 2. Prompt Engineering for Logic
Instead of vague prompts, senior developers use structured instructions in the `code` block.

**Optimized Prompt:**
```python
# CONTEXT: You are a professional auction moderator.
# DATA: Record values are in 'records'.
# INSTRUCTION: If 'records.description' contains non-English text or 
# phone numbers in the format XXX-XXX-XXXX, set 'state' to 'needs_review'.
# Otherwise, set 'is_ai_verified' to True.
```

!!! tip "Architect Tip: Determinism"
    AI actions are non-deterministic. Never use them for critical financial calculations or legal compliance. Use them for **Moderation**, **Summarization**, and **Categorization** where a human final check is part of the flow.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Actions glue the UI to logic; Server Actions execute Python or AI prompts in batch.
*   **Architect Insight:** Odoo 19 AI actions use `AI_CONTEXT` to provide environmental awareness to the LLM, enabling "Smart" automation without complex Python.
*   **Verify Your Knowledge:** What is the `binding_model_id` field used for? (Answer: It makes the action appear in the "Action" dropdown menu at the top of a list view).

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
