# Odoo 19 ensure_one() Method

## Definition and Usage
The `ensure_one()` method is used to verify that a recordset contains exactly one record. 

If the recordset is empty or contains more than one record, Odoo will raise a `ValueError` (often referred to as a "Expected singleton" error). This is a crucial safety check to prevent logic errors when performing operations that only make sense for a single record.

## Why Use It?
- **Avoid Singleton Errors:** Ensures your code doesn't crash when it expects one record but receives multiple.
- **Data Integrity:** Prevents applying logic intended for one record (like calculating a specific price) to a collection of records.
- **Code Clarity:** Explicitly states that the following logic requires a single record context.

---

## Syntax
```python
self.ensure_one()
```

---

## Examples

### Basic Example
In this example, we ensure that the method is acting on a single auction listing before updating its state.

```python
def action_confirm(self):
    # This will raise an error if self contains 0 or 2+ records
    self.ensure_one()
    self.state = 'confirmed'
```

### Handling Multiple Records
If you need to handle multiple records, you should loop through them or use `ensure_one()` inside a loop if the internal logic requires it.

```python
def update_all_listings(self):
    for record in self:
        record.ensure_one()  # Redundant if inside loop, but good for clarity
        record.state = 'active'
```

---

## Technical Note
In Odoo 19, `ensure_one()` is frequently used in button actions and computed field methods where the logic is specific to an individual record.

---

## Senior: Performance & Testing

### The "Loop" Cost
While `ensure_one()` is fast, calling it inside a high-frequency loop can add micro-overhead. If you are already iterating over `self` (e.g., `for rec in self:`), the record `rec` is guaranteed to be a singleton. Adding `rec.ensure_one()` inside that loop is redundant.

### Testing for Singletons
When writing unit tests, you should verify that your methods correctly enforce the singleton rule.

```python
def test_action_confirm_multi_error(self):
    # Create a recordset with 2 records
    multi_listings = self.listing | self.listing.copy()
    
    # Verify that it raises the 'Expected singleton' error
    with self.assertRaises(ValueError):
        multi_listings.action_confirm()
```

!!! tip "Architect Tip"
    If you find yourself using `ensure_one()` too often, consider if your method should be refactored to handle recordsets natively (batch processing). Batch-friendly methods are always superior to singleton-locked methods in Odoo.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** `ensure_one()` raises an error if a recordset does not contain exactly one record.
*   **Architect Insight:** Senior developers write batch-capable methods whenever possible. `ensure_one()` is for "Last Mile" safety in sensitive logic.
*   **Verify Your Knowledge:** Why should you avoid `ensure_one()` inside a `for rec in self:` loop? (Answer: Because `rec` is already guaranteed to be a singleton).

!!! success "Next Step"
    Safety first. Now let's [Create Records](../crud/create.md) at scale.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
