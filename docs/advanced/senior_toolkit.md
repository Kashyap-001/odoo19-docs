# Senior Toolkit: Professional Odoo Development

This toolkit provides the standards and procedures required for high-level Odoo engineering and project management.

---

## 1. Standard Operating Procedures (SOPs) for Git in Odoo

To maintain a clean, bisectable, and professional history, follow these rules:

### Branching Strategy
*   **Feature Branches:** `feature/<module_name>-<short_description>`
*   **Fix Branches:** `fix/<module_name>-<short_description>`
*   **Refactor Branches:** `refactor/<module_name>-<short_description>`

### Commit Message Standards
Use the Odoo standard format: `[MOD] module_name: short description`

*   `[ADD]`: New module or major feature.
*   `[FIX]`: Bug fix.
*   `[REF]`: Refactoring code without behavior change.
*   `[REM]`: Removing code or files.
*   `[MOV]`: Moving files.
*   `[IMP]`: Improvement of existing feature.
*   `[SEC]`: Security fix.

**Example:**
`[FIX] auction_marketplace: ensure bid increment is strictly positive`

### Commit Hygiene
*   **Atomic Commits:** One logical change per commit.
*   **No "WIP" Commits:** Squash intermediate commits before merging.
*   **Linear History:** Prefer `git rebase` over `git merge` for feature branches.

---

## 2. Writing Technical Specifications for Odoo

A technical spec bridges the gap between functional requirements and code implementation.

### Required Sections
1.  **Overview:** Context and business goal.
2.  **Data Model Changes:**
    *   New models (Name, Inherit, Description).
    *   New fields (Name, Type, String, Help, Attributes like `readonly`, `required`).
3.  **Business Logic:**
    *   Methods to override (e.g., `create`, `write`, `action_confirm`).
    *   New methods and their logic (pseudo-code or flowcharts).
    *   Computed fields and their dependencies (`@api.depends`).
    *   Constraints (`@api.constrains` and SQL constraints).
4.  **UI/UX Changes:**
    *   View modifications (XPath locations).
    *   New menus and actions.
    *   Specific widget requirements (e.g., `selection_badge`).
5.  **Security:**
    *   New Groups (XML IDs and Category).
    *   Access Rights (ACLs).
    *   Record Rules (Row-level security).
6.  **Performance Considerations:**
    *   Expected data volume.
    *   Need for SQL indexes.
    *   Avoidance of O(N) operations in loops.

---

## 3. High-Quality Odoo Code Review Checklist

### Security
*   [ ] Is `sudo()` used sparingly and justified?
*   [ ] Are ACLs (`ir.model.access.csv`) defined for all new models?
*   [ ] Are record rules sufficient to prevent data leakage between users/companies?
*   [ ] Is there any potential for SQL injection (using `self.env.cr.execute` with string formatting)?

### Performance
*   [ ] Are there any "Database queries in a loop"? (N+1 problem)
*   [ ] Are computed fields using `depends` correctly to avoid over-computation?
*   [ ] Are large datasets handled with `search_fetch()` or `batches`?
*   [ ] Is `mapped()` used instead of manual loops for field extraction?

### Naming & Style
*   [ ] Does it follow Odoo's [official coding guidelines](https://www.odoo.com/documentation/17.0/developer/reference/standard_modules/coding_guidelines.html)?
*   [ ] Are field names descriptive and follow Odoo conventions (e.g., `_id` for M2O, `_ids` for O2M/M2M)?
*   [ ] Are XML IDs unique and descriptive?

### Functional Correctness
*   [ ] Does the code handle "Multi-company" environments correctly?
*   [ ] Are `ensure_one()` checks present where a single record is expected?
*   [ ] Are translations handled via `_()`?

---

## 4. Managing Client Expectations in ERP Projects

ERP implementations are high-stakes. Manage them professionally:

1.  **Standard First:** Always demonstrate how to achieve a goal using standard Odoo features before proposing a customization. "Configuration over Customization."
2.  **The 80/20 Rule:** 80% of the value often comes from 20% of the features. Identify "Must-haves" vs "Nice-to-haves" early.
3.  **Clear Boundaries:** Define the "Out of Scope" explicitly in every specification.
4.  **Frequent Demos:** Show progress weekly. Never wait until the end of a 3-month project to show a feature.
5.  **Technical Debt Warning:** Explain the long-term maintenance cost of complex customizations (migration effort, potential bugs).
6.  **Data is King:** Remind clients that software is only as good as the data they put into it. Start data cleaning early.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
