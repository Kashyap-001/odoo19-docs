# Odoo 19 QWeb Reports

In Odoo 19, QWeb reports have been updated to improve performance and developer efficiency. This guide covers the essential updates for professional Odoo developers.

---

## The t-out Directive

The `t-out` directive is the new standard for outputting values in Odoo 19.

### Why use t-out?
The previously used `t-esc` directive is now **deprecated**. Odoo 19 uses `t-out` as a safer and more versatile alternative. It automatically escapes HTML content unless the value is marked as "safe" (e.g., using `Markup` in Python).

### Example
```xml
<!-- Deprecated: Avoid using t-esc -->
<span t-esc="o.name"/>

<!-- Standard: Use t-out in Odoo 19 -->
<span t-out="o.name"/>
```

## Template Inheritance: inheritance_mode="inner" (New)

Odoo 19 introduces `inheritance_mode="inner"` at the template level. This is distinct from the `mode="inner"` attribute on XPath tags and is specifically designed for QWeb template extension.

### What is inheritance_mode="inner"?
When defined on a `<template>` tag, it allows the inheriting module to replace only the **inner content** of the parent template's root element, rather than the entire element itself. This is extremely useful for maintaining layout consistency while changing the content.

### Example
```xml
<template id="report_custom_header" inherit_id="base.report_header" inheritance_mode="inner">
    <!-- This content replaces everything INSIDE the base header, 
         but the base header's <header> tag and its classes remain! -->
    <div class="custom-logo">...</div>
</template>
```

---

## XPath Positioning: mode="inner"

## Senior Tip: High-Performance Loops

When generating reports that loop over a large recordset, database query overhead can significantly slow down the rendering process.

### Use prefetch=True for ORM Efficiency
In Odoo 19, ensure you are utilizing the ORM's prefetching capabilities. When you pass a list of IDs to `browse()` or use the new `search_fetch()` method, Odoo automatically groups records into "prefetch sets."

This means that when you access a field for the first record in a loop, Odoo "pre-fetches" that field for **all** records in the set in a single SQL query, rather than one query per record (the N+1 problem).

### Example
```python
# Senior Pro Approach: Browse all IDs at once to trigger prefetching
listing_ids = self.env['auction.listing'].search([]).ids
listings = self.env['auction.listing'].browse(listing_ids)

for listing in listings:
    # Accessing listing.name here will fetch names for ALL listings in one query!
    print(listing.name) 
```

> **Senior Tip:** Always browse recordsets as a batch before passing them to the QWeb context. This ensures the report engine can render loops with minimal database round-trips.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** `t-out` is the mandatory Odoo 19 replacement for `t-esc`.
*   **Architect Insight:** `mode="inner"` in XPath allows you to surgically replace content inside a tag without losing its attributes or CSS classes.
*   **Verify Your Knowledge:** Why is prefetching important in reports? (Answer: To avoid the N+1 query problem during PDF generation for multiple records).

!!! success "Next Step"
    You're almost there. Now verify your work with [Unit Testing](../testing/unit_tests.md).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
