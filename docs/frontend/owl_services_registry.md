---
title: Odoo 19 OWL Services & Registries
description: Understand the OWL service layer and registries in Odoo 19. Learn how to leverage built-in services like 'orm', 'notification', and 'action', and how to register custom services.
---

# Odoo 19: OWL Services & Registries

In Odoo 19, the frontend is built using **OWL 2.0 (Odoo Web Library)**. A key architectural shift in Odoo is the use of the **Service Layer**. Instead of global objects, functionalities (ORM calls, notifications, actions) are provided as **Services**.

---

## 1. Using Built-in Services
Services are injected into components using the `useService` hook.

```javascript
import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class MyComponent extends Component {
    setup() {
        // Inject core services
        this.orm = useService("orm");
        this.notification = useService("notification");
        this.action = useService("action");
    }

    async doSomething() {
        // Use the injected ORM service
        const data = await this.orm.call("auction.listing", "do_something", [1]);
        this.notification.add("Action completed!", { type: "success" });
    }
}
```

---

## 2. The Registry Pattern
The **Registry** is a global key-value store used to register various frontend components, services, and patches.

```javascript
import { registry } from "@web/core/registry";

// Registering a new action component
registry.category("actions").add("my_action_tag", MyActionComponent);
```

---

## 3. 🏁 Senior Checkpoint
*   **Architect Insight:** Never use `window` or global objects to interact with Odoo core functionalities. Always use the `useService` hook to ensure compatibility and testability.
*   **Pro Tip:** If you need to extend existing functionalities, use the `registry` categories (e.g., `fields`, `services`, `actions`) rather than patching component prototypes.
