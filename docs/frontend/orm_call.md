---
title: Odoo 19 JS to Python Tutorial — Invoking Python methods via orm.call
description: Learn how to trigger backend Python model methods from the OWL frontend in Odoo 19 using the orm service's call() method.
---

# JS to Python: Using orm.call()

In Odoo's frontend framework (OWL), you often need to fetch data from the server or trigger Python methods. The primary tool for this is the `orm` service.

---

## 1. Injecting the ORM Service

To use the ORM in an OWL component, you must first inject it using the `useService` hook.

```javascript
import { Component, xml } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class AuctionDashboard extends Component {
    setup() {
        // Inject the ORM service
        this.orm = useService("orm");
    }
}
```

---

## 2. Basic Syntax: orm.call()

The `call` method is the bridge to your Python models.

**Syntax:**
`this.orm.call(model, method, args, kwargs)`

### Example: Fetching Bids
Suppose you have a Python method `get_top_bids()` on your `auction.listing` model.

```javascript
async fetchBids() {
    const bids = await this.orm.call(
        "auction.listing", // The Model
        "get_top_bids",    // The Method
        [this.props.id],   // Positional Arguments (args)
        { limit: 5 }       // Keyword Arguments (kwargs)
    );
    this.state.bids = bids;
}
```

---

## 3. Standard ORM Methods from JS

You don't just call custom methods; you can use all standard CRUD methods directly from JavaScript.

### Search and Read
```javascript
const records = await this.orm.searchRead(
    "res.partner", 
    [ ["is_company", "=", true] ], // Domain
    ["name", "email"]              // Fields
);
```

### Write (Update)
```javascript
await this.orm.write("auction.listing", [recordId], {
    state: "closed"
});
```

### Unlink (Delete)
```javascript
await this.orm.unlink("auction.listing", [recordId]);
```

---

## 4. Senior: Performance & Security

### 1. Avoid Heavy Loops
Never call `orm.call()` inside a JavaScript `forEach` or `map` loop. Each call triggers a separate network request (HTTP). 
- **Senior Approach:** Pass a list of IDs to a single Python method and return all data in one go.

### 2. Sudo and Permissions
JavaScript calls respect the permissions of the logged-in user. If the user doesn't have ACL access to a model, the `orm.call()` will fail with an "Access Error".
- **Security Tip:** Never pass sensitive data (like `sudo()` flags) from JS. Handle security elevation strictly inside the Python method.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** The `orm` service is the standard way for OWL components to communicate with the Odoo backend.
*   **Architect Insight:** `orm.call` is asynchronous (returns a Promise). Always use `async/await` to handle the response cleanly.
*   **Verify Your Knowledge:** What happens if you call a Python method that doesn't exist via `orm.call`? (Answer: The server will return a 500 error, and the JS Promise will reject).

!!! success "Next Step"
    Frontend is connected. Now ensure everything works with [Unit Testing](../testing/unit_tests.md).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
