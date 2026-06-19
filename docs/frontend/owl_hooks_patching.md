---
title: Odoo 19 OWL Hooks: Reactive Programming
description: Master OWL 2.0 functional hooks in Odoo 19. Learn how to manage state with useState, control lifecycle side-effects with useEffect, and use references with useRef.
---

# Odoo 19: OWL Hooks Masterclass

Odoo 19 utilizes **OWL 2.0 (Odoo Web Library)**, which features a reactive programming model governed by **Hooks**. Hooks are special JavaScript functions that allow you to "hook into" component lifecycle events and state management.

```mermaid
graph TD
    Comp[Component setup] -->|useState| State[Reactive State (triggers re-renders)]
    Comp -->|useEffect| Effect[Lifecycle Side-Effects / DOM access]
    Comp -->|useRef| Ref[DOM Element Reference]
```

---

## 1. State Management: `useState()`

`useState()` defines a reactive object. When any property in this object changes, OWL automatically schedules a re-render of the component template.

*   **Rule**: `useState` must be declared inside the component `setup()` method.
*   **Behavior**: It wraps the object in a JavaScript `Proxy` to track mutations.

```javascript
import { Component, useState } from "@odoo/owl";

export class AuctionCounter extends Component {
    static template = "pways_auction.Counter";

    setup() {
        // Initialize reactive state
        this.state = useState({
            count: 0,
            active: true
        });
    }

    increment() {
        this.state.count++; // Mutating this automatically schedules UI update
    }
}
```

---

## 2. Side Effects: `useEffect()`

`useEffect()` controls execution of code that interacts with elements outside the component (e.g. subscribing to events, calling raw APIs, or manually manipulating the browser DOM).

*   **Trigger**: Runs after the component is rendered, and re-runs whenever specified dependencies change.
*   **Cleanup**: You can return a cleanup function to prevent memory leaks (e.g. removing listeners).

```javascript
import { Component, useState, useEffect } from "@odoo/owl";

export class LiveBidTicker extends Component {
    setup() {
        this.state = useState({ lastBid: 0 });

        useEffect(
            () => {
                // 1. Triggered on mount or when state.lastBid changes
                console.log(`Bid updated: ${this.state.lastBid}`);
                document.title = `Highest Bid: $${this.state.lastBid}`;

                // 2. Optional: Return cleanup function
                return () => {
                    console.log("Cleaning up title changes...");
                };
            },
            () => [this.state.lastBid] // Dependency array
        );
    }
}
```

---

## 3. DOM Referencing: `useRef()`

`useRef()` provides a safe way to reference a specific HTML element inside the component's template without writing slow document queries.

*   **Syntax**: Assign a name to the reference inside `setup()`, and add a `t-ref` attribute to the target element in the QWeb template.

### JavaScript
```javascript
import { Component, useRef } from "@odoo/owl";

export class FocusInputComponent extends Component {
    setup() {
        // Create the reference placeholder
        this.inputRef = useRef("bidInput");
    }

    focusInput() {
        // Access the raw HTML element
        this.inputRef.el.focus();
    }
}
```

### QWeb Template
```xml
<templates>
    <t t-name="pways_auction.FocusInputComponent">
        <div>
            <!-- Bind tag to ref -->
            <input type="number" t-ref="bidInput" placeholder="Place bid..."/>
            <button t-on-click="focusInput">Focus</button>
        </div>
    </t>
</templates>
```

---

## 4. Lifecycle Hooks Reference

OWL components do not have class methods for lifecycles (like `componentDidMount`). Instead, they use hooks inside `setup()`.

| Lifecycle Hook | Execution Point | Primary Use Case |
| :--- | :--- | :--- |
| **`onWillStart`** | Before the component is rendered (async). | Prefetching data from RPC. |
| **`onMounted`** | After the component is appended to the DOM. | Attaching third-party JS libraries, focusing elements. |
| **`onWillUnmount`** | Right before the component is destroyed. | Destroying third-party instances, unbinding global events. |
| **`onWillUpdateProps`** | Before new props are applied to the component. | Calculating values based on incoming prop shifts. |

```javascript
import { Component, onWillStart, onMounted } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

export class AuctionDetail extends Component {
    setup() {
        this.orm = useService("orm");

        onWillStart(async () => {
            // Load necessary listing data before rendering HTML
            this.listingData = await this.orm.read("auction.listing", [this.props.listingId]);
        });

        onMounted(() => {
            console.log("Auction visual details successfully loaded onto user screen.");
        });
    }
}
```

---

## 🏁 Senior Checkpoint

*   **Key Concept**: Hooks like `useState` and `useRef` provide functional reactive bindings and lifecycle bindings in OWL.
*   **Architect Insight**: Always return a cleanup function in `useEffect` or use `onWillUnmount` to release listeners. Failing to clean up sockets or document listeners results in client-side memory exhaustion over long ERP sessions.
*   **Verify Your Knowledge**: Can you call `useState` conditionally (e.g. inside an `if` block)? (Answer: No. Hooks must always be declared at the top-level of `setup()` and run in the exact same order on every execution).
