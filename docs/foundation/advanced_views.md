# Reporting & Specialized Views

Beyond the standard List and Form views, Odoo provides a powerful suite of reporting and specialized views to visualize data and manage business processes.

---

## 1. Pivot View (`<pivot>`)

The Pivot view is Odoo's built-in "Excel-style" reporting tool. It allows users to perform real-time data analysis without leaving the ERP.

### Example: Sales Analysis
```xml
<pivot string="Auction Analysis" sample="1">
    <field name="date" type="row"/>
    <field name="category_id" type="col"/>
    <field name="amount" type="measure"/>
</pivot>
```

### Key Attributes
- **`type="row"`**: Groups data by this field on the vertical axis.
- **`type="col"`**: Groups data on the horizontal axis.
- **`type="measure"`**: The value being aggregated (summed, averaged).

---

## 2. Graph View (`<graph>`)

The Graph view provides a visual representation of your data (Bar, Line, Pie charts).

### Example: Bid Trends
```xml
<graph string="Bid Trends" type="line" sample="1">
    <field name="create_date" interval="day"/>
    <field name="amount" type="measure"/>
</graph>
```

### Supported Types
- `bar` (Default)
- `line`
- `pie`

---

## 3. Calendar View (`<calendar>`)

The Calendar view displays records on a timeline, ideal for meetings, auctions, or deadlines.

```xml
<calendar string="Auction Schedule" 
          date_start="date_start" 
          date_stop="date_end" 
          color="seller_id" 
          mode="month">
    <field name="name"/>
    <field name="seller_id" avatar_field="avatar_128"/>
</calendar>
```

---

## 4. Activity View (`<activity>`)

The Activity view (Odoo 12+) provides a bird's-eye view of all pending tasks and activities across records. It is a dedicated dashboard for the `mail.activity.mixin`.

```xml
<activity string="Auction Activities">
    <templates>
        <div t-name="activity-box">
            <field name="name" display="full"/>
        </div>
    </templates>
</activity>
```

---

## 5. Senior: Advanced View Features

### Search Panels in Reporting
You can combine Pivot/Graph views with a `<searchpanel>` in the search view to allow users to filter reports dynamically by category or status.

### Custom Measures
If you want to use a field as a measure in Pivot/Graph views, it must be an **Integer** or **Float** field. By default, Odoo aggregates using `SUM`. You can change this using the `group_operator` attribute in the Python model:

```python
# In models/auction_listing.py
amount = fields.Float("Bid Amount", group_operator="avg") # Now shows Average in Pivot
```

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Pivot and Graph views turn raw records into actionable business intelligence.
*   **Architect Insight:** The `sample="1"` attribute is critical for modern Odoo; it shows "blurred" demo data if the view is empty, encouraging users to engage.
*   **Verify Your Knowledge:** What is the difference between `type="row"` and `type="col"` in a Pivot view? (Answer: Row is vertical grouping; Col is horizontal grouping).

!!! success "Next Step"
    Reports are ready. Now automate the logic with [Scheduled Actions](../business/crons.md).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
