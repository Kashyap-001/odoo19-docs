# Unique Identifiers: ir.sequence

In business applications, you often need a unique, sequential reference number for documents (e.g., `AUC/001`, `AUC/002`). Odoo provides the `ir.sequence` model to handle this automatically.

---

## 1. Defining the Sequence (XML)

First, define the sequence rules in a data file (e.g., `data/ir_sequence_data.xml`).

```xml
<odoo>
    <data noupdate="1">
        <record id="seq_auction_listing" model="ir.sequence">
            <field name="name">Auction Listing Sequence</field>
            <field name="code">auction.listing</field>
            <field name="prefix">AUC/%(year)s/</field>
            <field name="padding">3</field>
            <field name="company_id" eval="False"/>
        </record>
    </data>
</odoo>
```

### Key Attributes
- **`code`**: A unique string key used to call this sequence from Python.
- **`prefix`**: Text added before the number (can include placeholders like `%(year)s`, `%(month)s`).
- **`padding`**: Number of digits (e.g., `3` results in `001`, `4` results in `0001`).

---

## 2. Calling the Sequence (Python)

To generate the number, override the `create()` method in your model.

```python
from odoo import models, fields, api

class AuctionListing(models.Model):
    _name = 'auction.listing'

    code = fields.Char(string="Reference", required=True, copy=False, readonly=True, default='New')

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if vals.get('code', 'New') == 'New':
                # Call the sequence using the 'code' defined in XML
                vals['code'] = self.env['ir.sequence'].next_by_code('auction.listing') or 'New'
        return super().create(vals_list)
```

### Why use `copy=False`?
This ensures that when a record is duplicated, the unique reference is **not** copied, allowing `create()` to generate a fresh one.

---

## 3. Senior: Gaps in Sequences

In high-concurrency environments (many users creating records at the exact same second), standard sequences can sometimes cause database locks.

### Performance Tip: "No Gap" Sequences
Odoo supports a "Standard" vs "No Gap" implementation.
- **Standard**: Fast, but if a transaction fails, a number might be skipped (e.g., 1, 2, 4).
- **No Gap**: Ensures no numbers are ever skipped, but it is significantly slower because it locks the database table during generation.

!!! tip "Architect Tip"
    Only use "No Gap" for legal requirements (like Invoices). For everything else (Auctions, Tasks, Leads), use the default Standard sequence for better performance.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** `ir.sequence` is the standard tool for generating professional, formatted reference numbers.
*   **Architect Insight:** Always override `create()` to inject the sequence, and set `copy=False` on the field to prevent ID collisions during duplication.
*   **Verify Your Knowledge:** What does a padding of `5` do to the number `42`? (Answer: It becomes `00042`).

!!! success "Next Step"
    Unique IDs are ready. Now bridge the gap to the browser with [orm.call()](../frontend/orm_call.md).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
