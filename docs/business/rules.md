---
title: Odoo 19 Record Rules Tutorial — Row-Level Security & Multi-Company Constraints
description: Learn to configure Odoo 19 record rules. Write custom SQL domain filters, configure allowed_company_ids variables, and prevent data leakage.
---

# Security: Record Rules (Row-Level Security)

While Access Control Lists (ACL) handle permissions at the model level, **Record Rules** provide granular, record-level security. They determine exactly which records a user can see or modify based on a domain filter.

---

## 1. What is a Record Rule?

A record rule is a standard Odoo record stored in the `ir.rule` model. It defines:
*   **The Model**: Which model the rule applies to.
*   **The Domain**: A filter that selects the allowed records.
*   **The Permissions**: Which operations (Read, Write, Create, Delete) the rule applies to.
*   **The Groups**: Which users are affected by the rule.

---

## 2. Record Rule Syntax (XML)

Record rules are typically defined in an XML file (e.g., `security/security_rules.xml`).

```xml
<record id="rule_auction_listing_seller" model="ir.rule">
    <field name="name">Sellers: Own Listings Only</field>
    <field name="model_id" ref="model_auction_listing"/>
    <field name="domain_force">[('seller_id', '=', user.partner_id.id)]</field>
    <field name="groups" eval="[(4, ref('pways_auction.group_auction_seller'))]"/>
    <field name="perm_read" eval="True"/>
    <field name="perm_write" eval="True"/>
    <field name="perm_create" eval="True"/>
    <field name="perm_unlink" eval="False"/>
</record>
```

### Field Breakdown:
*   **`model_id`**: The reference to the model ID (e.g., `model_auction_listing`).
*   **`domain_force`**: The heart of the rule. It is an Odoo domain evaluated on the server.
    *   `user`: Refers to the current user's record (`res.users`).
    *   `user.partner_id.id`: The ID of the partner linked to the user.
*   **`groups`**: A list of groups to apply the rule to.
    *   **Tip**: If you omit the `groups` field, the rule becomes a **Global Rule** (applies to everyone).

---

## 3. Global vs. Group-specific Rules

Odoo combines rules differently depending on their type:

| Type | Combination Logic |
| :--- | :--- |
| **Global Rules** | Combined using **AND**. A user must satisfy *all* global rules to see a record. |
| **Group-specific Rules** | Combined using **OR**. A user must satisfy *at least one* rule for their groups. |

**The Master Logic:**
`(Global Rule 1 AND Global Rule 2) AND (Group Rule A OR Group Rule B)`

---

## 4. Common Use Cases

### A. Seller Isolation (Own Records Only)
Prevent sellers from seeing each other's listings.
`domain_force = [('seller_id', '=', user.partner_id.id)]`

### B. Multi-Company Security
In a multi-company environment, ensure users only see data for their current company.
`domain_force = [('company_id', 'in', company_ids)]`
*(Note: `company_ids` is a special variable available in the domain context in Odoo 19).*

### C. Public/Portal Access
Allow portal users to see only "Published" auctions.
`domain_force = [('state', '=', 'published')]`

---

## 5. Senior Tip: Performance & Complexity

!!! danger "Performance Warning"
    Record rules are added to every SQL query performed on the model. If your `domain_force` is extremely complex (e.g., using many `many2many` joins), it can significantly slow down the system. 

**Best Practice:**
*   Keep domains simple.
*   Avoid using `child_of` or `parent_of` in rules unless necessary.
*   Ensure fields used in the domain are **indexed** in the database.

---

## 6. How to Bypass Record Rules

Sometimes, you need to execute code that ignores security rules (e.g., a background cron job that calculates stats across all sellers).

In Python, use `.sudo()`:
```python
# This will return all listings regardless of the current user's permissions
all_listings = self.env['auction.listing'].sudo().search([])
```

---

## Senior: Advanced Rule Logic

### 1. Rule Overlapping & Conflict
If a user is in **two groups** and each group has a record rule for the same model, Odoo combines them with an **OR** operator.
- **Group A Rule**: `[('state', '=', 'draft')]`
- **Group B Rule**: `[('state', '=', 'published')]`
- **Resulting Domain**: `['|', ('state', '=', 'draft'), ('state', '=', 'published')]`

### 2. User Root (UID 1) vs. Internal Admin
- **UID 1 (Superuser)**: Bypasses all rules.
- **Internal Admin (UID 2+)**: If they are in the `base.group_system` group, they still **must** satisfy record rules unless the code uses `.sudo()`. 

!!! success "Architect Tip: Debugging Rules"
    If you are confused why a user can see a record, use the **Settings > Technical > Security > Record Rules** menu. Open the rule and click the "Test Rule" button (if available) or use the `ir.rule` search to see exactly which rules are active for a specific user ID.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Record Rules (Row-level) act as a secondary filter after ACL (Model-level).
*   **Architect Insight:** Group-specific rules are combined with **OR**, while Global rules are combined with **AND**. This distinction is critical for multi-company isolation.
*   **Verify Your Knowledge:** Does the Admin user (UID 1) follow Record Rules? (Answer: No, the Superuser bypasses all security).

!!! success "Next Step"
    The skeleton is complete. Now dive into the [ORM Engine](../env/env_deep_dive.md) to write the brain of your app.

---

## Summary
Record Rules are the "scalpel" of Odoo security. While ACLs grant broad access, Record Rules refine that access to ensure data privacy and integrity. Mastering the `domain_force` syntax is key to building professional Odoo modules.

---

## 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. What is the main difference between ACLs and Record Rules?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="ACLs handle permissions at the model level (who can access the table), while Record Rules handle permissions at the record level (which specific rows a user can see or modify)." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">2. What are the four main components of a Record Rule definition?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="The Model, the Domain (filter), the Permissions (Read/Write/Create/Delete), and the Groups (optional)." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">3. How are Global Rules combined compared to Group-specific Rules?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="Global Rules are combined using AND (all must be satisfied), while Group-specific Rules are combined using OR (at least one must be satisfied)." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">4. How can you bypass Record Rules in Python code?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="By using the .sudo() method on the environment or a recordset." onclick="checkQuiz(this)">Check Answer</button>
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
