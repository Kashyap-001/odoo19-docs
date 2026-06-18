# Search Views: Finding Data Efficiently

Every module in Odoo requires a **Search View**. While List and Kanban views show your data, the Search View determines how users filter, group, and navigate that data.

---

## 1. Basic Structure

A search view is defined with the `<search>` tag. It is always linked to a specific model.

```xml
<record id="view_auction_listing_search" model="ir.ui.view">
    <field name="name">auction.listing.search</field>
    <field name="model">auction.listing</field>
    <field name="arch" type="xml">
        <search string="Auction Search">
            <!-- 1. Searchable Fields -->
            <field name="name" string="Listing Title"/>
            <field name="seller_id"/>
            <field name="category_id" operator="child_of"/>
            
            <!-- 2. Filters -->
            <filter string="Draft" name="state_draft" domain="[('state', '=', 'draft')]"/>
            <filter string="Open" name="state_open" domain="[('state', '=', 'open')]"/>
            
            <!-- 3. Group By -->
            <group expand="0" string="Group By">
                <filter string="Seller" name="group_seller" context="{'group_by': 'seller_id'}"/>
                <filter string="Category" name="group_category" context="{'group_by': 'category_id'}"/>
            </group>
        </search>
    </field>
</record>
```

---

## 2. Advanced Filters & Grouping

### Common Filter Patterns
Filters use Odoo **Domains** to slice data.
- **My Records:** `<filter string="My Auctions" name="my_auctions" domain="[('seller_id', '=', uid)]"/>`
- **Date Filtering:** `<filter string="Created Today" name="today" domain="[('create_date', '>=', context_today().strftime('%Y-%m-%d'))]"/>`

### Default Filters via Action
You can force a filter to be active by default when a menu is clicked by setting the `context` in the **Window Action**:
```xml
<field name="context">{'search_default_state_open': 1}</field>
```

---

## 3. The Modern Search Panel

Odoo 19 heavily utilizes the `<searchpanel>`, which appears as a sidebar on the left of List and Kanban views.

```xml
<search>
    ...
    <searchpanel>
        <field name="category_id" icon="fa-filter" groupby="parent_id" select="multi"/>
        <field name="state" icon="fa-list" select="multi"/>
    </searchpanel>
</search>
```

- **`groupby`**: Hierarchical filtering (e.g., Parent Category > Child Category).
- **`select="multi"`**: Allows users to select multiple categories at once.

---

## 4. Senior: Dynamic Search Panels

For Senior Architects, static search panels are often not enough. If you need to restrict the categories shown in the sidebar based on complex logic (e.g., only show categories that have active auctions), you can use the `_search_panel_domain_image` hook or dynamic domains in the action.

### Python-side Dynamic Filtering
While most search panel logic is handled by the web client, you can influence it by overriding `search_panel_select_multi_range` or using `search_panel_select_range`.

---

## 5. Senior: Advanced Logic & Inheritance

### Multi-field Searching with `filter_domain`
By default, a `<field>` in a search view only searches its own column. `filter_domain` allows one field to search across multiple attributes using an OR (`|`) domain.

```xml
<!-- One search box that checks both name AND reference -->
<field name="name" string="Title or Ref" 
       filter_domain="['|', ('name', 'ilike', self), ('reference', 'ilike', self)]"/>
```

### Search View Inheritance
Just like Forms or Lists, you can inherit and extend existing search views. This is critical for adding custom filters to core Odoo modules (like CRM or Sales).

```xml
<record id="view_auction_listing_search_inherit" model="ir.ui.view">
    <field name="inherit_id" ref="pways_auction.view_auction_listing_search"/>
    <field name="model">auction.listing</field>
    <field name="arch" type="xml">
        <xpath expr="//filter[@name='state_open']" position="after">
            <filter string="High Value" name="high_value" domain="[('price', '>', 5000)]"/>
        </xpath>
    </field>
</record>
```

### Explicitly Selecting a Search View
If a model has multiple search views, you can specify which one a Window Action should use by setting the `search_view_id`.

```xml
<record id="action_auction_special" model="ir.actions.act_window">
    ...
    <field name="search_view_id" ref="view_auction_listing_search_advanced"/>
</record>
```

!!! tip "Architect Insight"
    The Search Panel is a "heavy" component. Avoid using it on fields with thousands of unique values (like `res.partner`), as it will slow down the initial view load significantly.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Search views define the interface for `fields`, `filters`, and `groups`.
*   **Architect Insight:** Use `filter_domain` to create intuitive "Global Search" fields and `<searchpanel>` for e-commerce-style sidebar filtering.
*   **Verify Your Knowledge:** How do you make a filter active by default? (Answer: Use `search_default_<filter_name>` in the action context).

---

## 💻 Code Challenge

**Create a filter for the Auction Marketplace that finds all "High Value" listings (price > 1000):**

<div class="code-challenge">
<pre><code>&lt;filter string="High Value" name="high_value" <input type="text" class="quiz-input-inline w-150" data-answer="domain=\"[('start_price', '>', 1000)]\"">/&gt;</code></pre>
<button class="quiz-check" onclick="checkCodeChallenge(this)">Check Code</button>
<div class="quiz-result"></div>
</div>

---

## 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. Which XML tag is used to create a sidebar navigation for filtering?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="The `<searchpanel>` tag." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">2. How do you group records in a search view?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="By using a `<filter>` tag inside a `<group>` block with a `context={'group_by': 'field_name'}`." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">3. What does `operator="child_of"` do on a search field?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="It allows searching for a parent record and automatically includes all its children (hierarchical search)." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">4. Where should you place a Search View definition?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="Inside an `ir.ui.view` record with the `model` set to the target model." onclick="checkQuiz(this)">Check Answer</button>
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
