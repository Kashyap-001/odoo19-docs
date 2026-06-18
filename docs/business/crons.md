---
tags:
  - Automation
  - Backend
  - XML Data
  - Odoo 19
---

# Scheduled Actions (Cron Jobs)

In enterprise applications, you often need tasks to run automatically in the background without user intervention. In Odoo, this is handled by **Scheduled Actions** (Cron Jobs).

## 1. What is a Cron Job?
A Cron Job is a database record in the `ir.cron` model. Odoo's background worker processes periodically check this table and execute the Python code associated with any job whose scheduled time has passed.

---

## 2. Defining a Cron via XML

You should define your crons in an XML data file so they are automatically installed with your module.

```xml title="data/cron.xml"
<odoo>
    <data noupdate="1">
        <record id="ir_cron_close_expired_auctions" model="ir.cron">
            <field name="name">Auction: Close Expired Listings</field>
            <field name="model_id" ref="model_auction_listing"/>
            <field name="state">code</field>
            <field name="code">model._cron_close_expired()</field>
            <field name="user_id" ref="base.user_root"/>
            <field name="interval_number">5</field>
            <field name="interval_type">minutes</field>
            <field name="numbercall">-1</field>
            <field name="doall" eval="False"/>
            <field name="active" eval="True"/>
        </record>
    </data>
</odoo>
```

### Key Fields Explained:
*   `model_id`: The model where your python logic lives.
*   `code`: The exact python method to call. Use `model` to reference the class.
*   `user_id`: Crons usually run as the Superuser (`base.user_root`).
*   `interval_number` & `interval_type`: How often it runs (e.g., every 5 minutes).
*   `numbercall`: How many times it should run (`-1` means infinitely).
*   `noupdate="1"`: Prevents Odoo from overwriting the cron schedule if the user modifies it in the UI and then upgrades the module.

---

## 3. Writing the Python Logic

The python method called by the cron should be decorated with `@api.model` because it operates on the class level, not on a specific recordset.

```python title="models/auction_listing.py"
from odoo import models, fields, api

class AuctionListing(models.Model):
    _name = 'auction.listing'
    # ...

    @api.model
    def _cron_close_expired(self):
        """Finds all open auctions whose end_date has passed and closes them."""
        # 1. Search for expired auctions
        expired_auctions = self.search_fetch(
            [('state', '=', 'open'), ('end_date', '<=', fields.Datetime.now())],
            ['id', 'state']
        )
        
        # 2. Process them in batch
        if expired_auctions:
            expired_auctions.write({'state': 'closed'})
            # Optional: Trigger an email or invoicing logic here
```

---

## 4. Senior Tip: Batch Processing and Timeouts

Crons have a hard timeout limit (often 15 minutes). If your cron processes millions of records, it might get killed before finishing, causing a rollback.

**The Architect's Approach:**
Process records in chunks and commit the transaction explicitly.

```python
    @api.model
    def _cron_process_heavy_data(self):
        # Fetch 1000 records at a time
        records = self.search([('state', '=', 'pending')], limit=1000)
        for rec in records:
            rec.process()
            
        # Commit the transaction so progress is saved
        self.env.cr.commit()
        
        # If there are more records, trigger the cron to run again immediately
        if len(records) == 1000:
            self.env.ref('my_module.my_cron_id')._trigger()
```

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Crons automate background tasks based on time intervals.
*   **Architect Insight:** Use `cr.commit()` carefully in heavy crons to save progress, and always wrap crons in `<data noupdate="1">` so system admins can adjust the schedule.
*   **Verify Your Knowledge:** Why must a cron method use `@api.model`? (Answer: Because the cron doesn't have an active recordset when it wakes up; it calls the method on the class itself).

!!! success "Next Step"
    Automation is running. Now learn about transforming your logic with [mapped, filtered, and sorted](../search/mapped.md).

---

## 🛠️ Master Project Challenge: The Auction Hammer
Auctions must close automatically when their time is up.

**Goal:** Create a cron job to close auctions.
1. Create a `data/cron.xml` file.
2. Define an `ir.cron` that runs every 5 minutes.
3. Call a `@api.model` method named `_cron_check_expirations` on `auction.listing`.

??? success "Show Solution"
    ```xml title="data/cron.xml"
    <odoo>
        <data noupdate="1">
            <record id="cron_close_auctions" model="ir.cron">
                <field name="name">Auction: Auto-Close</field>
                <field name="model_id" ref="model_auction_listing"/>
                <field name="state">code</field>
                <field name="code">model._cron_check_expirations()</field>
                <field name="interval_number">5</field>
                <field name="interval_type">minutes</field>
                <field name="numbercall">-1</field>
                <field name="doall" eval="False"/>
            </record>
        </data>
    </odoo>
    ```

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
