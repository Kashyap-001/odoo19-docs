---
title: Odoo 19 AbstractModel Pattern
description: Understand how to use AbstractModel in Odoo 19 for building reusable service layers and clean architecture mixins.
---

# Odoo 19 Architecture: What is an AbstractModel?

... (Read about [Odoo Architecture](../foundation/architecture.md) for more context.)

In Odoo, not every model needs a database table. When you want to share logic across multiple models or create a "Service Layer" for external integrations, you use **`models.AbstractModel`**.

---

## 1. Definition & Purpose

An **AbstractModel** is a model that:
1.  **Does NOT create a database table.**
2.  Can define fields and methods.
3.  Is designed to be inherited by other models using `_inherit`.

### Use Cases:
- **Service Layers**: Handling logic for Stripe, DHL, or Twilio.
- **Mixins**: Adding "Follower" or "Archiving" logic to multiple custom models.
- **Reporting**: Acting as a data provider for complex QWeb PDF reports.

---

## 2. Implementing an AbstractModel

```python
from odoo import models, fields, api

class ExternalSyncService(models.AbstractModel):
    _name = 'base.external.sync'
    _description = 'Abstract Service for API Sync'

    last_sync_date = fields.Datetime("Last Sync")

    def sync_data(self):
        # Logic to talk to an external API
        print("Syncing...")
        return True
```

### Inheriting the Logic
```python
class AuctionListing(models.Model):
    _name = 'auction.listing'
    _inherit = ['auction.listing', 'base.external.sync'] # Inherit the service
```

---

## 3. AbstractModel vs. TransientModel vs. Model

| Feature | `models.Model` | `models.TransientModel` | `models.AbstractModel` |
| :--- | :--- | :--- | :--- |
| **Database Table** | Yes (Permanent) | Yes (Temporary) | **No** |
| **Data Persistence** | Permanent | Cleared periodically | N/A |
| **Inheritance** | Standard | Standard | **Mixin/Template** |
| **Use Case** | Business Data | Wizards/Popups | **Logic Sharing** |

---

## 4. Senior: The Service Layer Pattern

For high-end Odoo architecture, we use AbstractModels to decouple "Technical Logic" from "Business Data."

**The Problem:** If you put your Stripe API code directly inside `sale.order`, your model becomes cluttered and hard to test.

**The Solution:**
1.  Create `StripeService` as an **AbstractModel**.
2.  Put all API calls, signature verification, and error handling in the Service.
3.  `sale.order` calls `self.env['stripe.service'].process_payment(self)`.

### Why this is "Senior":
- **Testability**: You can easily "mock" the AbstractModel in unit tests.
- **Reusability**: You can now use the same Stripe service for `account.move` or `website.sale` without duplicating code.
- **Upgradability**: If you switch to a different payment provider, you only change the Service Layer, not your core business models.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** AbstractModels provide a way to share fields and logic without bloating the database with unnecessary tables.
*   **Architect Insight:** Treat AbstractModels as "Contract Templates." They define *how* something should work, leaving it to the concrete Models to handle the actual data.
*   **Verify Your Knowledge:** Can you browse an AbstractModel? (Answer: You can call methods on it via `self.env['name']`, but you cannot browse record IDs because there is no table).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
