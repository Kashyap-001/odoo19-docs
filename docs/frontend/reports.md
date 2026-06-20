---
title: Odoo 19 QWeb Reports Tutorial — XML PDF Templates & Data Providers
description: Master Odoo 19 PDF printing and QWeb templates. Learn how to write report actions, define layouts, optimize loop speed, configure paper formats, and write AbstractModel data providers.
---

# QWeb & Reports (v19)

## QWeb PDF Report Engine
In Odoo 19, printable documents (such as Invoices, Purchase Orders, and Custom Certificates) are designed using **QWeb HTML/XML Templates**. 

When a user clicks "Print," Odoo renders these templates into high-quality HTML, which is then parsed and compiled into a PDF file using the **`wkhtmltopdf`** command-line utility.

```mermaid
graph TD
    Click[1. User clicks 'Print' in UI] --> Action[2. ir.actions.report record triggered]
    Action --> QWeb[3. QWeb Engine parses HTML template & variables]
    QWeb --> Data{4. Custom AbstractModel data provider?}
    Data -- Yes --> Python[Run _get_report_values and fetch dataset]
    Data -- No --> ORM[Read fields directly from active recordset]
    Python --> HTML[5. HTML document generated]
    ORM --> HTML
    HTML --> Wk[6. wkhtmltopdf compiles HTML to PDF binary]
    Wk --> Browser[7. PDF downloaded or printed directly]
```

---

## Standardized Document Generation (Invoices, Bids)
Traditional PDF generation libraries (like ReportLab or raw PDF code) require developers to specify coordinates and layout parameters manually, which is extremely tedious. 

Odoo's QWeb Report Engine solves this by allowing developers to write printable layouts using standard web standards: HTML5, CSS3, and Bootstrap grid styling. This decouples visual layout styling from backend database records.

---

## Generating Custom PDF Printouts
Use QWeb Reports whenever you need to produce standardized, printable business documents:
*   Official invoices and tax reports.
*   Product barcodes and shipping labels.
*   Auction certificates of authenticity or bid receipts.
*   Timesheets and activity logs.

---

## When to Use OWL Views (Interactive Dashboards)
*   Do not use QWeb Reports to output raw data grids (e.g. exporting 10,000 sales lines to Excel). Generating giant PDF layouts consumes massive server memory and triggers connection timeouts. Use **CSV/XLSX export controllers** instead.
*   Do not use QWeb HTML templates for emails; emails require a simpler in-line CSS structure (compiled via mail templates).

---

## QWeb Template Directives
QWeb templates are compiled on the server. Odoo evaluates QWeb attributes (prefixed with `t-`) to build the final HTML.

### Essential Directives Reference

| Directive | Description | Example |
| :--- | :--- | :--- |
| **`t-out`** | Safe HTML escaping (Standard in Odoo 19). | `<span t-out="o.name"/>` |
| **`t-field`** | Renders field values using default widgets (e.g., date formats, monetary symbols). | `<span t-field="o.amount" t-options="{'widget': 'monetary', 'display_currency': o.currency_id}"/>` |
| **`t-if` / `t-elif` / `t-else`** | Conditional rendering of elements. | `<span t-if="o.state == 'done'">Completed</span>` |
| **`t-foreach` & `t-as`** | Loop iteration. | `<tr t-foreach="o.line_ids" t-as="line">...</tr>` |
| **`t-set` & `t-value`** | Declare and assign helper variables. | `<t t-set="total" t-value="sum(l.price for l in o.line_ids)"/>` |
| **`t-att` / `t-attf`** | Dynamic attribute values (e.g., source urls, styling classes). | `<div t-attf-class="p-2 #{'text-success' if o.active else 'text-danger'}"/>` |
| **`t-call`** | Renders another template inside the current node. | `<t t-call="web.external_layout">...</t>` |

---

## Declaring Report Actions & QWeb PDF Templates

To create a PDF report, you must define:
1.  An **`ir.actions.report`** record to define the report properties.
2.  A **QWeb `<template>`** to design the HTML layout.

### A. The Report Action
```xml
<record id="action_report_auction_listing" model="ir.actions.report">
    <field name="name">Auction Listing Receipt</field>
    <field name="model">auction.listing</field>
    <field name="report_type">qweb-pdf</field> <!-- qweb-pdf or qweb-html -->
    <field name="report_name">pways_auction.report_listing_template</field>
    <field name="report_file">pways_auction.report_listing_template</field>
    <field name="paperformat_id" ref="paperformat_us_letter"/> <!-- Custom layout -->
    <field name="binding_model_id" ref="model_auction_listing"/>
    <field name="binding_type">report</field>
</record>
```

### B. Standard Layout Structure
QWeb utilizes structural Odoo wrappers (like `web.html_container` and `web.external_layout`) to ensure consistent corporate headers, footers, and page numbers:
```xml
<template id="report_listing_template">
    <t t-call="web.html_container">
        <!-- Iterate over records inside active recordset (passed as 'docs') -->
        <t t-foreach="docs" t-as="o">
            <t t-call="web.external_layout">
                <div class="page">
                    <!-- HTML Page Content Here -->
                    <h2 t-out="o.name"/>
                </div>
            </t>
        </t>
    </t>
</template>
```

---

## Designing Custom Paper Formats
If you need to print labels, custom ticket dimensions, or specific localized paper dimensions (like US Letter, Legal, or A4), you must register a `report.paperformat` record:

```xml
<record id="paperformat_auction_ticket" model="report.paperformat">
    <field name="name">Auction Ticket (80x150mm)</field>
    <field name="default">False</field>
    <field name="format">custom</field>
    <field name="page_width">80</field>
    <field name="page_height">150</field>
    <field name="orientation">Portrait</field>
    <field name="margin_top">5</field>
    <field name="margin_bottom">5</field>
    <field name="margin_left">5</field>
    <field name="margin_right">5</field>
    <field name="header_line">False</field>
    <field name="header_spacing">0</field>
    <field name="dpi">96</field>
</record>
```

Link this format to your report action using the `<field name="paperformat_id" ref="..."/>` tag inside your report action definition.

---

## Designing Invoices and Auction Receipt Layouts

### Beginner: Simple Certificate Template
Create a basic certificate sheet displaying a listing name and starting price using the new `t-out` directive.
```xml
<template id="report_listing_certificate">
    <t t-call="web.html_container">
        <t t-foreach="docs" t-as="o">
            <div class="page text-center border p-5 mt-5">
                <h1>Certificate of Authenticity</h1>
                <p>This document certifies the registration of:</p>
                <h2 class="text-primary" t-out="o.name"/>
                <p>Starting Value: <span t-field="o.starting_price"/></p>
            </div>
        </t>
    </t>
</template>
```

### Intermediate: Loop-Based Bid History Receipt
Loop through an auction's child bid records inside the printable invoice using Bootstrap tables.
```xml
<template id="report_listing_bids">
    <t t-call="web.html_container">
        <t t-foreach="docs" t-as="o">
            <t t-call="web.external_layout">
                <div class="page">
                    <h2>Bid History: <span t-out="o.name"/></h2>
                    <table class="table table-striped mt-4">
                        <thead>
                            <tr>
                                <th>Bidder</th>
                                <th>Date</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr t-foreach="o.bid_ids" t-as="bid">
                                <td><span t-out="bid.bidder_name"/></td>
                                <td><span t-field="bid.create_date"/></td>
                                <td><span t-field="bid.amount"/></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </t>
        </t>
    </t>
</template>
```

### Real-World: Custom Data Provider via AbstractModel
For complex reports requiring raw SQL queries, aggregates, or calculations that aren't stored on the model, create an **AbstractModel Data Provider**.

=== "Python Data Provider"
    ```python
    from odoo import api, models

    # Name MUST match 'report.your_module_name.your_template_id'
    class BidHistoryReport(models.AbstractModel):
        _name = 'report.pways_auction.report_bid_summary_template'
        _description = 'Bid Summary Data Provider'

        @api.model
        def _get_report_values(self, docids, data=None):
            # 1. Fetch listings
            docs = self.env['auction.listing'].browse(docids)
            
            # 2. Run complex query to fetch top bid stats
            self.env.cr.execute("""
                SELECT listing_id, MAX(amount) as max_amount, COUNT(id) as bid_count 
                FROM auction_bid 
                WHERE listing_id IN %s 
                GROUP BY listing_id
            """, [tuple(docids)])
            stats = {row['listing_id']: row for row in self.env.cr.dictfetchall()}

            # 3. Return variables injected into QWeb evaluation context
            return {
                'doc_ids': docids,
                'doc_model': 'auction.listing',
                'docs': docs,
                'bid_stats': stats,
            }
    ```

=== "QWeb Template"
    ```xml
    <template id="report_bid_summary_template">
        <t t-call="web.html_container">
            <t t-foreach="docs" t-as="o">
                <t t-call="web.external_layout">
                    <div class="page">
                        <h2 t-out="o.name"/>
                        <!-- Read data from python injected dict 'bid_stats' -->
                        <div class="alert alert-info mt-3">
                            Total Bids: <span t-out="bid_stats.get(o.id, {}).get('bid_count', 0)"/><br/>
                            Highest Bid: <span t-out="bid_stats.get(o.id, {}).get('max_amount', 0.0)"/>
                        </div>
                    </div>
                </t>
            </t>
        </t>
    </template>
    ```

---

## WKHTMLTOPDF CSS Bugs & Page Break Overlaps
Because `wkhtmltopdf` relies on an older WebKit rendering engine, certain CSS attributes behave unexpectedly. Follow these styling rules:

*   **Forced Page Break**: To force a section onto a new page, use `page-break-after: always;` or `page-break-before: always;`.
*   **Prevent Splitting Inside Tables**: Tables are prone to splitting row content across pages, resulting in cut-off text. Fix this by wrapping cells and rows with:
    ```css
    tr, td {
        page-break-inside: avoid !important;
    }
    ```
*   **Flexbox and Grid Limitation**: Flexbox (`display: flex`) is poorly supported in many `wkhtmltopdf` versions. Use Bootstrap's traditional float grids (`col-6`, `col-4`) or classic HTML table layouts for side-by-side components.

---

## Multi-Company Logos and Localized Reports
To support multi-company installations, corporate assets (logos, addresses, tax IDs) must load dynamically depending on the company associated with the record:

```xml
<!-- Display company logo dynamically -->
<img t-if="o.company_id.logo" t-att-src="image_data_uri(o.company_id.logo)" style="max-height: 45px;"/>
```

To automatically translate reports into the recipient customer's language, use the `t-lang` attribute:
```xml
<!-- Load translations using the customer's partner language -->
<t t-call="web.html_container">
    <t t-foreach="docs" t-as="o">
        <t t-call="web.external_layout" t-lang="o.partner_id.lang">
            <div class="page">
                <h2>Invoice: <span t-out="o.name"/></h2>
            </div>
        </t>
    </t>
</t>
```

---

## Batch Rendering PDF generation and Cache Optimizations
*   **Batch Prefetching**: Always pre-load relational fields by calling `browse()` on all IDs at the start of your print method.
*   **Avoid complex Python methods inside the QWeb XML template**: Instead of executing `t-out="o.calculate_totals()"` inside a loop, pre-calculate the values in your Python report data provider class and pass them to the rendering context. This prevents N+1 query loops.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Pivot and Graph views turn raw records into actionable business intelligence. QWeb PDF reports compile standard HTML and CSS templates into printable documents using wkhtmltopdf.
*   **Architect Insight:** The `sample="1"` attribute is critical for modern Odoo; it shows "blurred" demo data if the view is empty, encouraging users to engage.
*   **Verify Your Knowledge:** What is the difference between `t-out` and `t-field`? (Answer: `t-out` outputs raw strings safely, whereas `t-field` parses Odoo field metadata and applies automatic formatting, translation, and widgets like monetary and datetime styling).

---

## 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. What Odoo model is used to define custom margins, DPI, page size, and orientation for PDF reports?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="report.paperformat" onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">2. Which CSS property prevents table rows (`&lt;tr&gt;`) from split-printing horizontally across two separate physical pages?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="page-break-inside: avoid;" onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

---

## 💻 Code Challenge

**Complete the XML loop in QWeb to print each child invoice line `name` using `t-out` while ensuring rows do not split during page breaks:**

<div class="code-challenge">
<pre><code>&lt;tbody&gt;
    &lt;tr t-foreach="o.line_ids" t-as="line" style="<input type="text" class="quiz-input-inline w-250" data-answer="page-break-inside: avoid;">"&gt;
        &lt;td&gt;&lt;span <input type="text" class="quiz-input-inline w-180" data-answer="t-out=&quot;line.name&quot;">/&gt;&lt;/td&gt;
    &lt;/tr&gt;
&lt;/tbody&gt;</code></pre>
<button class="quiz-check" onclick="checkCodeChallenge(this)">Check Code</button>
<div class="quiz-result"></div>
</div>

---

## Report Generation & Compilation Flow
*   **Previous Lesson**: [Assets & Bundles](assets.md)
*   **Next Lesson**: [Unit Testing](../testing/unit_tests.md)
*   **See Also**: [AbstractModel Pattern](../advanced/abstract_models.md), [Prefetching Mechanism](../advanced/prefetching.md)

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
