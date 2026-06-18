# Views & XML Syntax: Building the UI

In Odoo, the User Interface is defined using **XML**. These XML files describe how the data from your Python models should be presented to the user.

---

## 1. The List View (`<list>`)

The List view (formerly known as `tree` view) displays records in a table format. In Odoo 19, the tag `<list>` is the standard.

### Example: Auction Bids
```xml
<list string="Bids" decoration-info="state == 'draft'" decoration-success="state == 'won'">
    <field name="bidder_id"/>
    <field name="amount" widget="monetary"/>
    <field name="date"/>
    <field name="state" widget="badge"/>
</list>
```

---

## 2. The Form View (`<form>`)

The Form view is used to create and edit single records. It is the most complex and powerful view.

### Standard Structure
```xml
<form>
    <header>
        <button name="action_confirm" string="Confirm" type="object" invisible="state != 'draft'" class="btn-primary"/>
        <field name="state" widget="statusbar"/>
    </header>
    <sheet>
        <div class="oe_title">
            <h1><field name="name" placeholder="Listing Title"/></h1>
        </div>
        <group>
            <field name="product_id"/>
            <field name="initial_price"/>
        </group>
    </sheet>
    <chatter/>
</form>
```

---

## 3. Modern Kanban View (`<kanban>`)

Odoo 19 has completely overhauled the Kanban view. The traditional `<kanban-box>` and `t-name="kanban-box"` templates have been replaced by the much simpler and more powerful `<card>` element.

### The Shift to `<card>`
The `<card>` element provides a structured way to define Kanban layouts without writing complex custom CSS or QWeb logic.

### Professional Kanban Card Example
```xml
<kanban default_group_by="state" class="o_kanban_small_column">
    <field name="currency_id"/>
    <templates>
        <t t-name="card">
            <div class="d-flex mb-1">
                <field name="name" class="fw-bold fs-5"/>
                <field name="current_price" widget="monetary" class="ms-auto fw-bold"/>
            </div>
            <footer class="d-flex align-items-center mt-2">
                <field name="seller_id" widget="many2one_avatar_user"/>
                <div class="ms-auto">
                    <field name="bid_count"/> Bids
                </div>
            </footer>
        </t>
    </templates>
</kanban>
```

!!! success "Why use <card>?"
    - **Better Performance**: Faster rendering thanks to the new OWL engine.
    - **Cleaner Code**: No more messy `oe_kanban_global_click` or complex DIV nesting.
    - **Native Spacing**: Built-in support for headers, bodies, and footers.

---

## 4. The Search View (`<search>`)

The Search view defines the filtering and grouping options available in the top-right search bar of List and Kanban views.

### Basic Structure
```xml
<search>
    <field name="name"/>
    <field name="seller_id"/>
    <field name="category_id" operator="child_of"/>
    
    <!-- Filters: Quick toggle for specific domains -->
    <filter string="Open Auctions" name="open_state" domain="[('state', '=', 'open')]"/>
    <filter string="My Listings" name="my_listings" domain="[('seller_id', '=', uid)]"/>
    
    <separator/>
    
    <!-- Group By: Cluster records by a field -->
    <group expand="0" string="Group By">
        <filter string="Seller" name="group_by_seller" context="{'group_by': 'seller_id'}"/>
        <filter string="State" name="group_by_state" context="{'group_by': 'state'}"/>
    </group>
    
    <!-- Search Panel: Left-side navigation (Odoo 19 Style) -->
    <searchpanel>
        <field name="category_id" icon="fa-filter" groupby="parent_id" select="multi"/>
        <field name="state" icon="fa-list" select="multi"/>
    </searchpanel>
</search>
```

---

## 5. Master Widget Catalogue

Widgets change how a field is rendered in the UI without altering the underlying database structure. Odoo 19 provides dozens of built-in widgets.

| Widget | Compatible Fields | UI Result | Example Use Case |
| :--- | :--- | :--- | :--- |
| `monetary` | Float, Monetary | Adds currency symbol & formatting. | `amount` ($100.00) |
| `statusbar` | Selection, Many2one | Clickable horizontal progress bar. | `state` (Draft > Open > Closed) |
| `badge` | Selection, Many2one | Rounded, colored pill (badge). | `status` (Active / Archieved) |
| `handle` | Integer | Drag-and-drop icon for reordering rows. | `sequence` in List views |
| `html` | Html, Text | Rich text editor (WYSIWYG). | `description` |
| `many2many_tags` | Many2many | Colored tag chips. | `category_ids` |
| `many2one_avatar` | Many2one | Shows user/partner profile picture. | `seller_id` |
| `progressbar` | Float, Integer | Visual progress bar (0-100%). | `completion_rate` |
| `percentage_pie` | Float | Small circular pie chart. | `win_probability` |
| `radio` | Selection, Many2one | Radio button list instead of dropdown. | `gender` |
| `boolean_toggle` | Boolean | iOS-style toggle switch. | `is_published` |
| `char_domain` | Char | Advanced domain builder widget. | Dynamic rules |
| `image` | Binary | Renders an uploaded image. | `photo` |

### Using Widgets in XML
```xml
<field name="state" widget="statusbar" options="{'clickable': '1'}"/>
<field name="category_ids" widget="many2many_tags" options="{'color_field': 'color'}"/>
<field name="is_published" widget="boolean_toggle"/>
```

!!! warning "Note"
    While older `<kanban-box>` templates still work for compatibility, new Odoo 19 modules should always use the `<card>` element for a future-proof UI.

---

## Senior: Dynamic View Overrides

### 1. The `get_views()` Hook (v16+)
In Odoo 19, the primary way to dynamically modify a view's XML before it is sent to the browser is by overriding the `get_views()` method. This is much more powerful than static XML inheritance because it allows you to change the UI based on real-time Python logic.

```python
@api.model
def get_views(self, views, options=None):
    res = super().get_views(views, options)
    
    # Check if we are in the Form view
    if 'form' in res['views']:
        # res['views']['form']['arch'] contains the XML string
        # You can use lxml to surgically insert or remove elements
        pass
        
    return res
```

### 2. `view_init` & `view_get`
While mostly deprecated in favor of `get_views()`, these older hooks are sometimes still found in legacy modules. Always prefer `get_views()` for Odoo 19 projects.

!!! tip "Architect Tip: JS Overrides"
    If your dynamic change is purely visual and doesn't affect security or data structure, consider using an **OWL Patch** (see Frontend section) instead of `get_views()`. JS-side changes are faster and don't add load to the Python server.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Odoo views are XML templates that the server compiles into JSON for the web client.
*   **Architect Insight:** Odoo 19's `<card>` element in Kanban views is a performance revolution, replacing complex QWeb logic with structured layouts.
*   **Verify Your Knowledge:** When should you use `get_views()` instead of standard XML inheritance? (Answer: When the UI must change dynamically based on Python logic or user groups).

!!! success "Next Step"
    You've built a standalone app. Now learn to extend existing ones in the [Inheritance Masterclass](../business/inheritance.md).

---

## 💻 Code Challenge

**Complete the XML definition for a simple Odoo 19 list view:**

<div class="code-challenge">
<pre><code>&lt;<input type="text" class="quiz-input-inline w-50" data-answer="list">&gt;
    &lt;field name="name"/&gt;
    &lt;field name="amount" widget="monetary"/&gt;
    &lt;field name="state" <input type="text" class="quiz-input-inline w-60" data-answer="widget">="badge"/&gt;
&lt;/<input type="text" class="quiz-input-inline w-50" data-answer="list">&gt;
</code></pre>
<button class="quiz-check" onclick="checkCodeChallenge(this)">Check Code</button>
<div class="quiz-result"></div>
</div>

---

## 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. Which XML tag is the Odoo 19 standard for defining a table-style list view?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="The `<list>` tag." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">2. What is the main advantage of the new `<card>` element in Kanban views?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="It provides a structured layout without the need for complex custom DIV nesting or QWeb logic, resulting in cleaner code and better performance." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">3. Which Python method should you override to dynamically modify a view's XML before it is rendered?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="The `get_views()` method." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">4. What widget should you use to display a User Many2one field as an avatar and name?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="`widget=&quot;many2one_avatar_user&quot;`." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
