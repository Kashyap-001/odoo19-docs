---
title: Odoo 19 Assets & Bundles Tutorial — JS, CSS, and SCSS Bundles
description: Master the Odoo 19 Assets Bundle system. Learn how to register CSS, SCSS, and OWL JavaScript files, extend core Odoo bundles, and debug asset compilation.
---

# Assets & Static Files

## 1. What is it?
In Odoo 19, static files such as JavaScript (ES6 modules), stylesheets (CSS, SCSS), and XML templates are compiled, minified, and delivered to the browser client through a centralized **Assets Bundle System**. You register these files inside the module's `__manifest__.py` file under the `assets` dictionary key.

```mermaid
graph TD
    Source[JS / SCSS / XML source files on Disk] --> Manifest[Registered in __manifest__.py assets]
    Manifest --> Compiler[Odoo Asset Compiler]
    Compiler --> Bundle[Minified, preprocessed SCSS, and bundled into single CSS / JS payload]
    Bundle --> Cache[Saved to database attachments and local cache files]
    Cache --> Client[Served to Browser Client with Gzip compression]
```

---

## 2. Why does it exist?
Modern web applications require hundreds of separate JavaScript modules and stylesheets. If a browser loaded every file individually, it would trigger hundreds of HTTP requests, blocking rendering pipelines and slowing page loads. 

Odoo's assets bundle compiler resolves this by:
*   Preprocessing SCSS files into standard CSS.
*   Resolving ES6 import-exports via a custom module loader.
*   Minifying and combining all static files into a single CSS payload and a single JS payload.
*   Adding cache-busting hashes to filenames to force clients to download updates only when changes are made.

---

## 3. When should I use it?
Use the `assets` key inside the manifest whenever you add:
*   **Custom styles** (CSS/SCSS) to Odoo's backend apps or public portal website.
*   **OWL Javascript components** (`static/src/**/*.js`).
*   **XML templates** for OWL components (`static/src/**/*.xml`).
*   **Custom libraries** (JS/CSS) to extend Odoo's web client capabilities.

---

## 4. When should I NOT use it?
*   Do not register **standard backend XML views** (like lists, forms, or actions) in the `assets` key; register them under the `'data'` key in `__manifest__.py`.
*   Do not place raw binary assets like images, logos, fonts, or PDFs in the `assets` bundle list. Simply save them inside your module's `/static/` folder (e.g. `/static/description/icon.png`) and reference them directly via URL.

---

## 5. Syntax

Asset files are declared in your `__manifest__.py` under the `'assets'` dictionary, categorized by **Asset Bundle Target Names**:

```python
'assets': {
    # 1. Target Backend Bundle
    'web.assets_backend': [
        'your_module/static/src/scss/custom_styles.scss',
        'your_module/static/src/components/**/*.js',
        'your_module/static/src/components/**/*.xml',
    ],
    # 2. Target Public Website/Portal Bundle
    'web.assets_frontend': [
        'your_module/static/src/scss/portal_styles.scss',
    ],
}
```

### Bundle Modifiers (Inheritance & Overrides)
You can manipulate existing Odoo assets bundles (such as injecting a script before another module, or excluding files):

| Operation | Syntax | Description |
| :--- | :--- | :--- |
| **Append** | `'path/to/file.js'` | Appends the file to the end of the bundle (Default). |
| **Prepend** | `('prepend', 'path/to/file.js')` | Inserts the file at the very beginning of the bundle. |
| **Before** | `('before', 'target_path.js', 'my_path.js')` | Inserts `my_path.js` right before `target_path.js`. |
| **After** | `('after', 'target_path.js', 'my_path.js')` | Inserts `my_path.js` right after `target_path.js`. |
| **Replace** | `('replace', 'target_path.js', 'my_path.js')` | Replaces `target_path.js` with `my_path.js`. |
| **Remove** | `('remove', 'target_path.js')` | Removes `target_path.js` from the bundle. |
| **Exclude** | `('include', 'other_bundle')` | Includes an entire other bundle's assets list. |

---

## 6. Multiple Examples

### Beginner: Injecting Custom CSS/SCSS Styles
Apply a global orange color layout to the headers in the Odoo backend.
```css title="static/src/css/header_override.css"
.o_main_navbar {
    background-color: #E27221 !important;
}
```
Register the style sheet in `__manifest__.py`:
```python title="__manifest__.py"
'assets': {
    'web.assets_backend': [
        'pways_auction/static/src/css/header_override.css',
    ],
}
```

### Intermediate: Registering an OWL Component
Create a dynamic bidding component with JavaScript logic and an XML view template.

=== "static/src/components/bid.js"
    ```javascript
    /** @odoo-module **/
    import { Component } from "@odoo/owl";
    import { registry } from "@web/core/registry";

    export class AuctionBidWidget extends Component {
        static template = "pways_auction.AuctionBidWidget";
        setup() {
            console.log("Widget initialized!");
        }
    }
    registry.category("view_widgets").add("auction_bid_widget", {
        component: AuctionBidWidget,
    });
    ```

=== "static/src/components/bid.xml"
    ```xml
    <templates xml:space="preserve">
        <t t-name="pways_auction.AuctionBidWidget">
            <div class="p-4 bg-light border rounded">
                <h5>Place Bid</h5>
                <input type="number" class="form-control" placeholder="Amount..."/>
            </div>
        </t>
    </templates>
    ```

=== "__manifest__.py"
    ```python
    'assets': {
        'web.assets_backend': [
            'pways_auction/static/src/components/bid.js',
            'pways_auction/static/src/components/bid.xml',
        ],
    }
    ```

### Real-World: Patching Core Odoo JS (Loading After Base Scripts)
Ensure a custom JavaScript utility loads immediately after Odoo's primary WebClient boots up.
```python title="__manifest__.py"
'assets': {
    'web.assets_backend': [
        ('after', 'web/static/src/webclient/webclient.js', 'pways_auction/static/src/utils/post_load_patch.js'),
    ],
}
```

---

## 7. Common Mistakes

### ❌ Omitting the `/** @odoo-module **/` Header
If you do not include this comment as the first line of your JavaScript files, Odoo's module compiler treats the file as a legacy global script, causing import statements (`import { Component } ...`) to raise syntax errors in the browser.
```javascript
// Wrong: Missing module declaration
import { Component } from "@odoo/owl";
```

### ✅ Adding Module Flag
```javascript
// Right: Tells compiler to translate to Odoo ES module structure
/** @odoo-module **/
import { Component } from "@odoo/owl";
```

---

## 8. Performance Notes
*   **Regenerate Asset Bundles**: While in standard developer mode, Odoo aggressively caches compiled assets. If your CSS or JS updates do not show up, append `?debug=assets` to your browser URL, or click **Regenerate Assets Bundles** in the Developer Debug menu to clear database attachment caches.
*   **Wildcard Performance**: Glob patterns like `static/src/**/*` compile all files in a folder. While clean, this can slow down developer startup speeds in massive projects. For production stability, declare files explicitly or limit recursive search depths.

---

## 9. Senior Notes
*   **Module Naming Rules**: Odoo ES modules translate file paths into identifiers. If a file is at `pways_auction/static/src/components/bid.js`, its module path is `@pways_auction/components/bid`. Keep paths predictable.
*   **Manifest Dependencies**: If you inherit or modify files inside another module's bundle (e.g. `web.assets_backend`), your module manifest **must** list that module inside the `'depends'` key to ensure proper loading order.

---

## 10. Related Topics
*   **Previous Lesson**: [JS to Python (orm.call)](orm_call.md)
*   **Next Lesson**: [Reactive State (Store)](../advanced_owl/store.md)
*   **See Also**: [Services & Registry](owl_services_registry.md), [Component Patching](../advanced_owl/patching.md)
