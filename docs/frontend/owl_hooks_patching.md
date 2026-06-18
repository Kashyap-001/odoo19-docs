---
title: Odoo 19 Advanced OWL Hooks & Patching
description: Master advanced OWL 2.0 patterns in Odoo 19. Learn how to use useState, useEffect, and useRef effectively, and how to use patch() for component extension.
---

# Odoo 19: Advanced OWL Hooks & Patching

OWL 2.0 provides a functional, reactive programming model powered by Hooks.

---

## 1. Core Hooks

| Hook | Purpose |
| :--- | :--- |
| `useState` | Creates a reactive state object that triggers re-renders. |
| `useEffect` | Runs side-effects (e.g., DOM manipulation, subscriptions) when state changes. |
| `useRef` | Accesses DOM elements or component instances. |

```javascript
import { useState, useRef, useEffect } from "@odoo/owl";

export class MyComponent extends Component {
    setup() {
        this.state = useState({ count: 0 });
        this.inputRef = useRef("myInput");
        
        useEffect(() => {
            console.log("Count changed to:", this.state.count);
        }, () => [this.state.count]);
    }
}
```

---

## 2. Component Patching (`patch`)
The `patch()` function is the modern, safe way to extend existing OWL components.

```javascript
import { patch } from "@web/core/utils/patch";
import { MyComponent } from "my.component";

patch(MyComponent.prototype, {
    doSomethingElse() {
        super.doSomethingElse();
        console.log("Patched functionality!");
    }
});
```

---

## 3. 🏁 Senior Checkpoint
*   **Architect Insight:** `patch()` is the preferred way to extend functionality. Do not modify component prototypes directly.
*   **Pro Tip:** Always clean up side effects in `useEffect` if they require it (e.g., event listeners), otherwise you will create memory leaks!
