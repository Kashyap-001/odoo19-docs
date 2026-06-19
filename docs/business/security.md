# Security: Access Control Lists (ACL)

Security in Odoo is multi-layered. To remember the layers, use the **A.C.I.D** model:

*   **A**ccess Rights (ACL): "Can I enter the building?" (Model-level).
*   **C**onstraints (SQL/Python): "Is the data valid?" (Data-level).
*   **I**nheritance (Logic): "Can I perform this action?" (Method-level).
*   **D**omains (Record Rules): "Which rooms can I enter?" (Row-level).

The first layer of defense is the **Access Control List (ACL)**.
 ACLs define which groups of users have permission to perform basic CRUD (Create, Read, Update, Delete) operations on a specific model.

---

## 0. Defining Security Groups (`res.groups`)

Before you can assign permissions in a CSV, you must define the **Groups** themselves. Groups are defined in XML and typically belong to a **Category** (which clusters groups together in the User Form).

### Example: Defining Auction Groups
Create a file named `security/security.xml`:

```xml
<odoo>
    <data noupdate="1">
        <!-- 1. Define a Category for our App -->
        <record id="module_category_auction" model="ir.module.category">
            <field name="name">Auction Management</field>
            <field name="description">Helps you manage auction roles.</field>
            <field name="sequence">10</field>
        </record>

        <!-- 2. Define the User Group -->
        <record id="group_auction_user" model="res.groups">
            <field name="name">User</field>
            <field name="category_id" ref="module_category_auction"/>
            <field name="implied_ids" eval="[(4, ref('base.group_user'))]"/>
        </record>

        <!-- 3. Define the Manager Group (Inherits from User) -->
        <record id="group_auction_manager" model="res.groups">
            <field name="name">Administrator</field>
            <field name="category_id" ref="module_category_auction"/>
            <field name="implied_ids" eval="[(4, ref('group_auction_user'))]"/>
            <field name="users" eval="[(4, ref('base.user_root')), (4, ref('base.user_admin'))]"/>
        </record>
    </data>
</odoo>
```

### Key Attributes
- **`category_id`**: Groups this role under "Auction Management" in the User settings.
- **`implied_ids`**: This is **inheritance for groups**. If a user is added to "Administrator", they are automatically added to "User" and "Internal User" (`base.group_user`).
- **`noupdate="1"`**: Important! This prevents Odoo from overwriting manual changes made by admins in the UI when the module is updated.

---

## 1. The `ir.model.access.csv` File

In Odoo, model-level permissions are managed via a CSV file located at `security/ir.model.access.csv`. This file is loaded into the `ir.model.access` model during module installation/update.

### Syntax Breakdown

A typical row in the CSV looks like this:

`id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink`

| Column | Description | Example |
| :--- | :--- | :--- |
| **id** | Unique XML ID for this access rule. | `access_auction_listing_manager` |
| **name** | Descriptive name for the rule. | `auction.listing.manager` |
| **model_id:id** | The model's XML ID. Format: `model_<model_name_with_underscores>`. | `model_auction_listing` |
| **group_id:id** | The XML ID of the group this rule applies to. | `pways_auction.group_auction_manager` |
| **perm_read** | Boolean (0 or 1). Can they view records? | `1` |
| **perm_write** | Boolean (0 or 1). Can they edit records? | `1` |
| **perm_create** | Boolean (0 or 1). Can they create new records? | `1` |
| **perm_unlink** | Boolean (0 or 1). Can they delete records? | `1` |

---

## 2. Group IDs and Model IDs

### The Model ID
Every model defined in Python (e.g., `class AuctionListing(models.Model): _name = 'auction.listing'`) automatically gets an XML ID in the format `model_auction_listing`. You **must** use this ID in your CSV.

### The Group ID
*   **Module-specific Groups**: Groups defined in your `security/security.xml` file (e.g., `pways_auction.group_auction_manager`).
*   **Core Groups**: Standard Odoo groups like `base.group_user` (Internal User) or `base.group_system` (Settings Manager).
*   **Public Access**: If you leave the `group_id:id` column **empty**, the permission applies to **all users** (including portal and public users).

---

## 3. Practical Example: Auction App

Suppose we have three roles:
1.  **Managers**: Can do everything.
2.  **Sellers**: Can view and create, but not delete.
3.  **Bidders**: Can only read.

```csv
id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
access_auction_manager,auction.manager,model_auction_listing,pways_auction.group_auction_manager,1,1,1,1
access_auction_seller,auction.seller,model_auction_listing,pways_auction.group_auction_seller,1,1,1,0
access_auction_bidder,auction.bidder,model_auction_listing,pways_auction.group_auction_bidder,1,0,0,0
```

---

## 4. Troubleshooting ACLs

If a user receives an "Access Error" when trying to perform an action:

1.  **Check the Model**: Ensure the error message matches the model in your CSV.
2.  **Check User Groups**: Go to **Settings > Users & Companies > Users**, find the user, and verify they belong to the correct group.
3.  **Check Module Dependency**: Ensure the module containing the security groups is listed in the `depends` section of your `__manifest__.py`.
4.  **No Group = Public**: Remember that an empty `group_id` grants access to everyone. Use this sparingly!

---

## 5. ACL vs. Record Rules

*   **ACL (This file)**: "Can I enter the building?" (Model-level access).
*   **Record Rules**: "Which rooms can I enter?" (Record-level access).

!!! warning "Important"
    If a user has **no** ACL permission for a model, they cannot see any records, even if a Record Rule says they can. ACL is the primary gatekeeper.

---

## 6. Odoo Security Error Hierarchy

When Odoo's security layers are violated, or when custom Python rules check data sanity, Odoo raises specific exceptions. As a developer, raising the correct exception is critical to triggering the appropriate user-facing warning box.

The main security-related exception classes located in `odoo.exceptions` are:

*   **`AccessError`**: Raised automatically by Odoo when a user fails an ACL (`ir.model.access`) or record rule (`ir.rule`) check. It triggers a strict **Red Access Denied modal** and aborts the database transaction.
*   **`MissingError`**: Raised when trying to perform operations on a recordset containing records that have been deleted from the database by another transaction.
*   **`UserError`**: Raised programmatically in Python code to block business logic flows when states are invalid (e.g. trying to cancel an invoice that is already paid). Triggers a **Yellow Warning popup box**.
*   **`ValidationError`**: Raised inside `@api.constrains` or write methods when field data values violate semantic constraints (e.g. setting price below zero). Triggers a **Red Error modal**.

*(For detailed usage and code patterns of these exceptions, refer to the [Exceptions & Error Handling Masterclass](../advanced/exceptions.md).)*

---

## Senior: Advanced Security Concepts

### 1. The "User ID 1" Exception
In Odoo, the user with ID `1` (usually the `admin` user) **bypasses all ACLs and Record Rules**. 
- **Architect Tip:** Never use the `admin` account for daily business operations. It can hide security bugs in your code because the system will never raise an "Access Error" for UID 1.

### 2. `allowed_company_ids` in Rules
When writing Record Rules for multi-company environments, always use the `allowed_company_ids` context variable instead of a single `company_id`.

**Correct Domain:**
`['|', ('company_id', '=', False), ('company_id', 'in', allowed_company_ids)]`

This ensures that if a user has "Company A" and "Company B" selected in their switcher, they can see data from both simultaneously.

### 3. `groups_id` vs `group_id`
In XML, you can assign multiple groups to a single record (like a menu or an action) using a Many2many field:
```xml
<field name="groups_id" eval="[(4, ref('base.group_user')), (4, ref('base.group_system'))]"/>
```

---

---

## 🏁 Senior Checkpoint
*   **Key Concept:** `ir.model.access.csv` is the "Front Door" of Odoo security.
*   **Architect Insight:** The `admin` user (UID 1) is a security trap; always test your ACLs with a standard user to ensure they are actually working.
*   **Verify Your Knowledge:** What happens if a model is missing from the CSV? (Answer: No one, except the Superuser, can access it).

!!! success "Next Step"
    Security is set. Now let's build the [User Interface](../foundation/views.md) to interact with your data.

---

## 💻 Code Challenge

**Complete the CSV header for a standard Odoo security file:**

<div class="code-challenge">
<pre><code>id,name,<input type="text" class="quiz-input-inline w-100" data-answer="model_id:id">,<input type="text" class="quiz-input-inline w-100" data-answer="group_id:id">,perm_read,perm_write,perm_create,perm_unlink
</code></pre>
<button class="quiz-check" onclick="checkCodeChallenge(this)">Check Code</button>
<div class="quiz-result"></div>
</div>

---

## 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. Where is the Model-level access control file located in an Odoo module?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="In `security/ir.model.access.csv`." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">2. What is the standard format for a model's XML ID in the security CSV?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="`model_<model_name_with_underscores>` (e.g., `model_auction_listing`)." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">3. What happens if you leave the `group_id:id` column empty in a security rule?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="The permission applies to **all users**, including portal and public users." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">4. Why is it a &quot;security trap&quot; to test your module only with the `admin` user (UID 1)?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="Because the `admin` user bypasses all ACLs and Record Rules, potentially hiding security bugs that would affect normal users." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

---

## 🛠️ Master Project Challenge: Lockdown
Our auction data is sensitive. We need to define who can do what.

**Goal:** Configure the `ir.model.access.csv` for the Auction module.
1.  **Managers**: Full access (1,1,1,1) to `auction.listing`.
2.  **Bidders**: Read-only access (1,0,0,0) to `auction.listing`.
3.  **Public**: No access to the backend models.

??? success "Show Solution"
    ```csv title="security/ir.model.access.csv"
    id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
    access_auction_listing_manager,auction.manager,model_auction_listing,pways_auction.group_auction_manager,1,1,1,1
    access_auction_listing_bidder,auction.bidder,model_auction_listing,pways_auction.group_auction_bidder,1,0,0,0
    ```

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
