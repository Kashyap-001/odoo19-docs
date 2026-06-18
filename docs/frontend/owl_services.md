# OWL Services Catalogue

In Odoo's frontend framework (OWL), **Services** are global, long-lived objects that provide utility functions to your components. They are the JavaScript equivalent of Odoo's Python Environment tools.

---

## 1. What is an Odoo Service?

A service in OWL is a piece of logic that runs in the background and can be accessed from any component. They handle cross-cutting concerns like showing notifications, making RPC calls to the server, or triggering window actions.

To use a service, you inject it into your component using the `useService` hook.

```javascript
import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class AuctionDashboard extends Component {
    setup() {
        this.notification = useService("notification");
        this.action = useService("action");
    }
}
```

---

## 2. The Core Services Reference

Odoo 19 provides several built-in services. Here are the most critical ones for daily development:

| Service Name | Primary Purpose | Key Methods |
| :--- | :--- | :--- |
| **`orm`** | Talk to Python models. | `call()`, `searchRead()`, `write()` |
| **`notification`** | Show toast alerts (top right). | `add(message, options)` |
| **`dialog`** | Show popup modals. | `add(DialogComponent, props)` |
| **`action`** | Trigger Odoo window actions. | `doAction(action_id_or_dict)` |
| **`rpc`** | Raw HTTP JSON-RPC calls. | `(route, params)` |
| **`user`** | Current user context. | `userId`, `hasGroup()` |
| **`router`** | Manipulate the URL hash. | `pushState()`, `current` |

---

## 3. Common Use Cases

### Showing a Notification
```javascript
// Success toast
this.notification.add("Bid placed successfully!", {
    type: "success", // success, warning, danger, info
    sticky: false,
});
```

### Triggering an Odoo Action
You can simulate a user clicking a menu item by triggering an action dictionary.
```javascript
// Open the "My Bids" list view
this.action.doAction({
    type: 'ir.actions.act_window',
    res_model: 'auction.bid',
    view_mode: 'list,form',
    domain: [['bidder_id', '=', this.user.userId]],
    target: 'current',
});
```

---

## 4. Senior: Building a Custom Service

As an architect, you might need a global state manager (like a WebSocket listener for live bids) that multiple components can share. You do this by registering a custom service.

### Step 1: Define the Service
```javascript
import { registry } from "@web/core/registry";
import { EventBus } from "@odoo/owl";

export const liveBidService = {
    dependencies: ["rpc"], // Requires the RPC service to function
    start(env, { rpc }) {
        const bus = new EventBus();
        
        // Polling loop or WebSocket connection here
        setInterval(async () => {
            const newBids = await rpc("/api/bids/latest");
            if (newBids.length > 0) {
                bus.trigger("new_bids", newBids);
            }
        }, 5000);

        return {
            bus,
        };
    }
};

// Register it
registry.category("services").add("live_bid", liveBidService);
```

### Step 2: Use It
```javascript
setup() {
    this.liveBid = useService("live_bid");
    this.liveBid.bus.addEventListener("new_bids", (ev) => {
        console.log("New bids arrived!", ev.detail);
    });
}
```

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Services are singleton utilities injected into components via `useService()`.
*   **Architect Insight:** Custom services registered in the `services` category are instantiated exactly once when the Odoo web client boots up, making them perfect for persistent connections or shared state.
*   **Verify Your Knowledge:** Which service is used to check if the current user belongs to a specific security group? (Answer: The `user` service using `hasGroup()`).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
