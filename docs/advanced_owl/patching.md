# Advanced OWL: Component Patching

In the Odoo ecosystem, the JavaScript framework (OWL) provides a unique mechanism called **Patching**. While traditional Object-Oriented Programming (OOP) relies on class inheritance, Odoo uses patching to modify the behavior of existing components globally without altering the original source code.

---

## 1. Why Patch instead of Inherit?

In standard JavaScript, you can extend a class using `extends`. However, in Odoo's web client, many components are already instantiated or referenced by other core modules. 

| Feature | Class Inheritance (`extends`) | Patching (`patch`) |
| :--- | :--- | :--- |
| **Scope** | Creates a **new** class. Only used where you explicitly call the new class. | Modifies the **existing** class. Affects every instance globally. |
| **Use Case** | Creating a specialized version of a component (e.g., a "CustomButton" based on "Button"). | Adding a feature to **all** buttons in the Odoo interface. |
| **Complexity** | Low - standard JS behavior. | Moderate - requires careful management of the `super` keyword and prototypes. |

!!! danger "Breaking Change: Death of Class.include"
    In Odoo 19, the legacy JavaScript inheritance system (`Class.include({})`) has been **completely removed**. You can no longer use it to extend web client classes. Patching is now the **only** way to modify existing core components.

### 💡 Analogy: The Decorated Public Statue
Think of a **Public Statue** (a core Odoo component) in a city square.

*   **Standard Inheritance (`extends`)**: You build a **new statue** in your backyard based on the original. Only people who visit your backyard see your version.
*   **Patching (`patch`)**: You walk into the city square and **put a hat** on the existing statue. Now, **every single person** who enters the city square sees the statue wearing a hat. 

Patching modifies the "Source of Truth" globally, which is why it is so powerful for UI-wide changes.

---

## 2. The `patch` Utility

Odoo provides the `patch` utility via the `@web/core/utils/patch` module.

### Syntax
```javascript
import { patch } from "@web/core/utils/patch";

patch(ObjectToPatch, "unique_patch_name", {
    // New methods or overrides
});
```

*   **ObjectToPatch**: Usually the prototype of a Component class (e.g., `ListController.prototype`).
*   **unique_patch_name**: A string used for debugging or unpatching.
*   **patchObject**: An object containing the new or overridden methods.

---

## 3. Detailed Guide: Patching a Component

### Step 1: Identify the Target
Suppose we want to add a confirmation dialog whenever a user tries to close the main WebClient (the shell of Odoo).

### Step 2: Implementation
We target the `WebClient` class from `@web/webclient/webclient`.

```javascript
/** @odoo-module **/

import { patch } from "@web/core/utils/patch";
import { WebClient } from "@web/webclient/webclient";
import { useService } from "@web/core/utils/hooks";

patch(WebClient.prototype, "pways_auction.WebClientConfirm", {
    setup() {
        // 1. Call the original setup() to ensure Odoo initializes correctly
        super.setup();
        
        // 2. Add custom services or state
        this.notification = useService("notification");
        console.log("WebClient Patched: Monitoring Auction Status...");
    },

    /**
     * Overriding an existing method
     */
    async requestService(name) {
        console.log(`Service requested: ${name}`);
        return super.requestService(name);
    }
});
```

---

## 4. Example: Patching a Standard Button

Sometimes you need to intercept clicks on core UI elements.

```javascript
import { patch } from "@web/core/utils/patch";
import { ListController } from "@web/views/list/list_controller";

patch(ListController.prototype, "pways_auction.ConfirmDelete", {
    async deleteRecords() {
        const confirmed = window.confirm("Are you sure you want to delete these records? This cannot be undone.");
        if (confirmed) {
            await super.deleteRecords();
        }
    }
});
```

---

## 5. Handling the `super` Keyword

When you patch a method, you are effectively wrapping the original function. To execute the original logic, you **must** use `super`.

*   **Failure to call `super.setup()`**: This is the most common error. Since `setup()` is where hooks like `useState` and `useService` are declared, omitting `super.setup()` will break the component entirely.
*   **Async Methods**: If the original method is asynchronous (returns a Promise), ensure you `await super.methodName()`.

---

## 6. Best Practices & Pitfalls

### Do:
*   **Use Unique Names**: Always prefix your patch name with your module name (e.g., `my_module.patch_name`).
*   **Keep it Surgical**: Only patch what you absolutely must.
*   **Call Super**: Unless you are intentionally replacing the entire logic.

### Don't:
*   **Patch for Local Changes**: If you only need a custom behavior in one specific view, use inheritance or create a new component.
*   **Heavy Logic in Setup**: Patching `setup()` adds overhead to every instantiation of that component. Keep it lean.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Patching modifies existing JS classes globally without creating new ones.
*   **Architect Insight:** Always call `super.setup()` first in a patched `setup()` to ensure Odoo's core hooks (like services and state) are initialized correctly.
*   **Verify Your Knowledge:** Why is patching better than inheritance for global UI changes? (Answer: Because it allows multiple modules to modify the same core component simultaneously).

!!! success "Next Step"
    Frontend mastered. Now learn about [QWeb Reports](../frontend/reports.md) in Odoo 19.

---

## Summary
Patching is Odoo's way of allowing modules to "collaborate" on the same UI components. It provides a powerful, global way to extend the web client while maintaining the integrity of the core framework.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
