---
title: OWL Reactive State & Store Tutorial — Global State Management
description: Master global state management in Odoo 19's frontend. Learn how to build reactive stores and share states across OWL components.
---

# Reactive State & Shared Stores

In modern Odoo development, managing data across multiple components requires a robust strategy. Odoo 19 leverages OWL's **Reactive System** and the **Service Architecture** to provide a centralized, shared state (often called a "Store").

---

## 1. The `reactive` Primitive

At the heart of state management is the `reactive()` function. It creates a "proxy" object that OWL tracks for changes.

### How it works:
When a property of a reactive object is modified, OWL automatically identifies every component that is currently "observing" that property and triggers a re-render.

```javascript title="static/src/store/auction_state_demo.js"
import { reactive } from "@odoo/owl";

const auctionState = reactive({
    highestBid: 100,
    bidderName: "John Doe",
});

// Any component using 'auctionState.highestBid' will re-render when this happens:
auctionState.highestBid = 150;
```

---

## 2. Odoo Services: The Shared Store

While `reactive` objects can be used locally, the professional way to share state globally in Odoo is via **Services**.

### Why use Services?
*   **Singletons**: A service is instantiated once and shared across the entire web client.
*   **Dependency Injection**: Services can depend on other services (like `rpc`, `notification`, or `orm`).
*   **Persistence**: The state in a service survives as the user navigates between different views (e.g., from List to Form view).

---

## 3. Creating a Custom Service (Step-by-Step)

Let's build an `auction_store` service to track live bids.

### Step 1: Define the Service Object
```javascript title="static/src/store/auction_store.js"
/** @odoo-module **/

import { registry } from "@web/core/registry";
import { reactive } from "@odoo/owl";

const auctionService = {
    // List of other services needed
    dependencies: ["rpc", "notification"],
    
    // The factory function that creates the service
    start(env, { rpc, notification }) {
        // Create the reactive state
        const state = reactive({
            listings: [],
            loading: false,
            
            async loadListings() {
                this.loading = true;
                try {
                    this.listings = await rpc("/auction/get_active_listings");
                } catch (e) {
                    notification.add("Failed to load listings", { type: "danger" });
                } finally {
                    this.loading = false;
                }
            }
        });

        // Initialize the store
        state.loadListings();

        // Return the state (this becomes the service instance)
        return state;
    },
};

// Step 2: Register the service in the 'services' category
registry.category("services").add("pways_auction.auction_store", auctionService);
```

---

## 4. Consuming the Service in Components

To use your store in an OWL component, use the `useService` hook.

```javascript title="static/src/components/auction_list.js"
import { Component, useState } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

class AuctionList extends Component {
    setup() {
        // 1. Inject the service
        this.auctionStore = useService("pways_auction.auction_store");
        
        // Note: You don't need 'useState' for the service itself, 
        // as the object returned by the service is already 'reactive'.
    }
}
```

---

## 5. Service Lifecycle

Services follow a specific lifecycle within the Odoo Web Client:

1.  **Registration**: When the JS bundle loads, the service is added to the `registry`.
2.  **Lazy Instantiation**: The service is **not** created until it is requested for the first time (via `useService` or as a dependency).
3.  **The `start()` call**: The `start()` function is executed exactly once.
4.  **Singleton Lifecycle**: The returned object persists until the browser page is refreshed.

---

## 6. Senior Tip: Event Bus vs. Store

| Tool | Purpose | Data Flow |
| :--- | :--- | :--- |
| **EventBus** | Signals / Notifications | "Fire and Forget" (e.g., "AuctionClosed") |
| **Reactive Store** | Data Synchronization | Single Source of Truth for values. |

**Rule of Thumb:** If you need to know a value (e.g., "What is the price?"), use a **Store**. If you need to know when something happened (e.g., "Price updated!"), use an **EventBus**.

---

## 7. Real-time Synchronization

In an auction app, you can combine the `bus_service` with your store to update prices instantly via Websockets.

```javascript title="static/src/store/auction_store.js"
// Inside the start() function of your service:
const bus = env.services.bus_service;
bus.addChannel("auction_channel");

bus.subscribe("new_bid", (payload) => {
    // Update the reactive state
    // Every component watching 'state.listings' will update automatically!
    const listing = state.listings.find(l => l.id === payload.listing_id);
    if (listing) {
        listing.highest_bid = payload.amount;
    }
});
```

---

## Summary
By combining `reactive` objects with Odoo's `services`, you create a powerful, centralized state management system that keeps your UI in sync with your business data effortlessly.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Odoo Services are singletons that provide shared state via `reactive()` objects.
*   **Architect Insight:** Use the `Bus Service` to bridge the gap between the Python server and your JS store for real-time auction updates.
*   **Verify Your Knowledge:** When should you use a Service instead of local `useState`? (Answer: When data needs to persist across different views or be shared between unrelated components).

!!! success "Next Step"
    State managed. Now learn to [Patch Core Components](patching.md) without inheritance.

---

## 🛠️ Master Project Challenge: The Live Ticker
Bidders need to see price changes instantly without refreshing the page.

**Goal:** Create an `auction_store` service.
1.  Define a `reactive` state with a `current_price` property.
2.  Register the service in the `services` category.
3.  Subscribe to the `bus_service` for "new_bid" notifications to update the store.

??? success "Show Solution"
    ```javascript title="static/src/store/auction_store.js"
    /** @odoo-module **/
    import { registry } from "@web/core/registry";
    import { reactive } from "@odoo/owl";

    const auctionStore = {
        dependencies: ["bus_service"],
        start(env, { bus_service }) {
            const state = reactive({
                current_price: 0.0,
            });

            bus_service.addChannel("auction_channel");
            bus_service.subscribe("new_bid", (payload) => {
                state.current_price = payload.amount;
            });

            return state;
        }
    };

    registry.category("services").add("pways_auction.auction_store", auctionStore);
    ```

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
