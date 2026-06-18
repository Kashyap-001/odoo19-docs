# Odoo 19 Architecture Patterns: Where Code Lives

A junior developer knows *how* to write a method. A Senior Architect knows *where* it belongs. Placing business logic in the wrong layer leads to "Spaghetti Code," circular dependencies, and unmaintainable modules.

---

## 1. The Core Decision Matrix

When adding a new feature, use this table to decide where the Python logic should reside:

| Feature Type | Recommendation | Why? |
| :--- | :--- | :--- |
| **Data Integrity / Validation** | **Model** (`@api.constrains`) | Ensures the rule is enforced regardless of how the data is created (UI, API, or CSV). |
| **Auto-calculated Fields** | **Model** (`@api.depends`) | Keeps data consistent across all views and reporting tools. |
| **Interactive Step-by-Step** | **Wizard** (`TransientModel`) | Keeps the main business model clean of "temporary" UI state data. |
| **Public Web API / Portal** | **Controller** (`http.Controller`) | Separation of concerns; controllers handle HTTP routing and security. |
| **External Integrations** | **Service Layer** (`AbstractModel`) | Decouples third-party logic (e.g., Stripe API) from your internal data models. |
| **Background / Periodic Tasks**| **Scheduled Action** (`Cron`) | Prevents the UI from hanging while processing heavy tasks. |

---

## 2. Pattern: Fat Model, Skinny Controller

In Odoo, we follow the **"Fat Model"** philosophy. 

- **Controllers should be thin**: They should only validate the HTTP request, extract parameters, and then call a method on a model.
- **Models should be heavy**: All business logic (pricing, approval flows, state changes) belongs in the model. This makes the logic reusable via RPC, Wizards, and even the Odoo Shell.

!!! danger "Bad Pattern: Controller Bloat"
    Writing 100 lines of logic inside a `@http.route` is a "Senior Sin." If you need to fix a bug in that logic later, you won't be able to test it via standard Odoo Unit Tests without making dummy HTTP calls.

---

## 3. Pattern: The "Service Layer" (AbstractModel)

For complex modules that talk to external APIs (e.g., an Auction Marketplace syncing with a real-time shipping carrier), don't put the carrier's API logic directly inside `auction.listing`. 

Instead, create a **Service Model** using `models.AbstractModel`.

```python
class ShippingService(models.AbstractModel):
    _name = 'auction.shipping.service'
    _description = 'Abstract Service for Shipping Integrations'

    def fetch_rates(self, weight, destination):
        # Pure logic: No database table, easy to mock in tests
        # Call External API here...
        return 15.50
```

---

## 4. Domain-Driven Module Design

Large Odoo projects should be split into **Layers** rather than one monolithic module. 

### The Recommended Stack:
1.  **`auction_core`**: Defines the base `models`, `security`, and `views`. No dependencies on other apps.
2.  **`auction_portal`**: (Depends on `auction_core`) Adds controllers and website routes for the public.
3.  **`auction_account`**: (Depends on `auction_core` and Odoo `account`) Bridges the auction logic to standard Invoicing.

!!! tip "Architect Insight: Circular Dependencies"
    If Module A depends on Module B, and Module B needs logic from Module A, you have a circular dependency error. Solve this by moving the shared logic into a third "Base" module (Module C) that both A and B can depend on.

---

## 5. Logic Placement Checklist

Before you write code, ask:
*   **Can this be done in SQL?** If yes, use a SQL Constraint or Index.
*   **Does this affect the "Self"?** If it changes record data, put it in the Model.
*   **Is this "Throwaway" data?** If it's just for a popup, use a TransientModel (Wizard).
*   **Is it real-time?** If it's for an OWL component to react, use the `bus_service`.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** "Fat Model, Skinny Controller" ensures logic is reusable and testable.
*   **Architect Insight:** Use `AbstractModels` as Service Layers to keep business models (tables) clean of technical integration logic.
*   **Verify Your Knowledge:** Where should you put logic that calculates the total price of an auction including fees? (Answer: In the Model, likely using `@api.depends`).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
