# Assets & Static Files

In Odoo 19, JS, CSS, and SCSS files are managed via the **Assets Bundle** system. You register these files in your `__manifest__.py` file under the `assets` key.

## The `assets` Key

The manifest structure allows you to group files based on where they should be loaded.

```python
'assets': {
    'web.assets_backend': [
        'pways_auction/static/src/css/custom_backend.css',
        'pways_auction/static/src/js/backend_logic.js',
    ],
    'web.assets_frontend': [
        'pways_auction/static/src/scss/portal_styles.scss',
    ],
},
```

### Main Asset Bundles

| Bundle Name | Purpose |
| :--- | :--- |
| `web.assets_backend` | Loaded when using the Odoo Backend (Apps, Settings, Models). |
| `web.assets_frontend` | Loaded on the public website and portal (e.g., Auction Bidding page). |
| `web.assets_common` | Loaded in both backend and frontend. |

---

## Loading Order & Wildcards

Odoo loads assets in the order they appear in the list. You can use glob patterns to load entire directories.

```python
'web.assets_backend': [
    'pways_auction/static/src/components/**/*.js',
    'pways_auction/static/src/components/**/*.xml',
],
```

!!! info "Important"
    Starting with Odoo 17+, XML templates for OWL components are often included directly in the `assets` bundle alongside JS files.

---

## Registering an OWL Component

When building a real-time bidding component, you need to register it so Odoo's registry can find it.

### 1. Create the JS File
`static/src/components/bid_component.js`:
```javascript
/** @odoo-module **/
import { Component } from "@odoo/owl";
import { registry } from "@web/core/registry";

export class BidComponent extends Component {
    static template = "pways_auction.BidComponent";
    // Component logic here
}

// Register for use in the backend
registry.category("view_widgets").add("auction_bid_widget", {
    component: BidComponent,
});
```

### 2. Update Manifest
```python
'assets': {
    'web.assets_backend': [
        'pways_auction/static/src/components/bid_component.js',
        'pways_auction/static/src/components/bid_component.xml',
    ],
},
```

---

## Debugging Assets

If your CSS or JS changes aren't appearing:
1. **Regenerate Assets:** Activate Developer Mode and click "Regenerate Asset Bundles" in the debug menu.
2. **Hard Refresh:** Use `Ctrl + F5` to bypass browser cache.
3. **Check Manifest:** Ensure the file path is correct and the module is upgraded.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** The `assets` key in `__manifest__.py` defines which JS/CSS bundles your module contributes to.
*   **Architect Insight:** `web.assets_backend` is the primary entry point for OWL components; use glob patterns `**/*.js` to maintain clean manifest files.
*   **Verify Your Knowledge:** What is the difference between `web.assets_backend` and `web.assets_frontend`? (Answer: Backend is for internal apps; Frontend is for the public website/portal).

!!! success "Next Step"
    Assets registered. Now master [Shared State](../advanced_owl/store.md) using Reactive Stores.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
