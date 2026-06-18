# Reporting & Specialized Views

Beyond the standard List and Form views, Odoo provides a powerful suite of reporting and specialized views to visualize data and manage business processes.

---

## 1. Pivot View (`<pivot>`)

The Pivot view is Odoo's built-in "Excel-style" reporting tool. It allows users to perform real-time multi-dimensional data analysis.

### Advanced Attributes
- **`display_quantity="1"`**: Automatically adds a "Count" column to the report.
- **`disable_linking="1"`**: Prevents users from clicking a cell to see the underlying records (useful for high-level summaries).
- **`sample="1"`**: Shows "blurred" sample data if the database is empty, helping users understand the report's potential.

```xml
<pivot string="Auction Analysis" sample="1" display_quantity="1">
    <field name="date" type="row"/>
    <field name="category_id" type="col"/>
    <field name="amount" type="measure"/>
</pivot>
```

---

## 2. Graph View (`<graph>`)

Graph views visualize trends and distributions using Bar, Line, or Pie charts.

### Supported Chart Types
- **`bar` (Default)**: Best for comparing categories. Add `stacked="1"` to stack values instead of showing them side-by-side.
- **`line`**: Best for time-series data (e.g., bid amounts over time).
- **`pie`**: Best for showing shares of a whole (e.g., percent of auctions by state).

```xml
<graph string="Bid Trends" type="line" sample="1">
    <field name="create_date" interval="day"/> <!-- Group by Day -->
    <field name="amount" type="measure"/>
</graph>
```

---

## 3. Calendar View (`<calendar>`)

The Calendar view displays records on a timeline, essential for scheduling auctions.

### Critical Attributes
- **`date_start`**: The field containing the event's start time (Required).
- **`date_stop`**: The field for the end time.
- **`color`**: Groups events by color based on this field (e.g., `seller_id`).
- **`quick_add="False"`**: Disables the ability to create records with just a name on the calendar (forces opening the form).

```xml
<calendar string="Auction Schedule" 
          date_start="date_start" 
          date_stop="date_end" 
          color="seller_id" 
          mode="month"
          quick_add="False">
    <field name="name"/>
    <field name="amount" widget="monetary"/>
</calendar>
```

---

## 4. Activity View (`<activity>`)

The Activity view provides a dashboard for the `mail.activity.mixin`. It is used to manage follow-ups, calls, and meetings across all records.

### Requirements
1. The Python model **must** inherit from `mail.activity.mixin`.
2. You must define a template for the activity "card".

```xml
<activity string="Auction Activities">
    <templates>
        <div t-name="activity-box">
            <field name="name" display="full"/>
            <div class="text-muted">
                <field name="activity_type_id"/>
            </div>
        </div>
    </templates>
</activity>
```

---

## 5. Senior: Advanced Architecture

### Search Panels in Reporting
Combine your reports with a `<searchpanel>` (defined in the search view) to allow users to filter complex reports by Category or Status with a single click.

### Custom Group Operators
If a field should be averaged instead of summed in a Pivot report, you must define it at the **Model level** in Python.

```python
# Group by average instead of sum
average_bid = fields.Float("Avg Bid", group_operator="avg")
```

!!! tip "Architect Insight"
    For high-performance reporting on millions of rows, avoid Pivot views on standard models. Instead, create a **PostgreSQL VIEW** in the database and a read-only Odoo model (`_auto = False`) to point at it.

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
