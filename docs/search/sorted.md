# Odoo sorted() Method

The `sorted()` method returns a recordset ordered by a specific key. It is the recordset equivalent of Python's built-in `sorted()` function but optimized for Odoo records.

---

## Sorting by Field Name

The simplest way to sort a recordset is by passing a field name as a string.

### Example
Sort partners by name:

```python
sorted_partners = partners.sorted(key='name')
```

### Reverse Order
To sort in descending order, set the `reverse` parameter to `True`:

```python
# Sort by creation date (newest first)
newest_partners = partners.sorted(key='create_date', reverse=True)
```

---

## Sorting with a Lambda Function

For more complex sorting logic, you can pass a `lambda` function.

### Example
Sort partners by the length of their name:

```python
complex_sort = partners.sorted(key=lambda r: len(r.name))
```

---

## Multiple Fields

You can sort by multiple fields by providing them in the key string, separated by commas (just like an SQL `ORDER BY`).

### Example
Sort by country, then by city:

```python
multi_sort = partners.sorted(key='country_id, city')
```

---

## Important Comparison

!!! info "Database vs In-Memory"
    - **`search(order='name desc')`**: Performs the sorting at the **database level** (SQL). Use this for large datasets.
    - **`sorted()`**: Performs the sorting **in-memory** (Python). Use this when you already have a recordset and need to change its order for display or logic purposes.

---

## Default Sorting

If you call `sorted()` without any arguments, Odoo will use the default order defined in the model's `_order` attribute.

```python
# Uses the model's default order
default_sorted = partners.sorted()
```

---

## Real-World Example: Bids in an Auction

In an auction system, you might want to sort bids to find the winner:

```python
# 'bids' is a recordset of auction.bid
# Sort by amount (highest first)
winning_bids = bids.sorted(key='amount', reverse=True)

# Get the top bid
highest_bid = winning_bids[0] if winning_bids else False
```

---

## Senior: M2O Sorting Performance

When you sort by a **Many2one** field (e.g., `sorted('partner_id')`), Odoo doesn't just sort by the ID. It sorts by the display name (`_rec_name`) of the related records.

### The Hidden Cost
If the related model has a complex `_rec_name` or a computed `display_name`, calling `sorted()` on a large recordset can trigger hundreds of compute calls or SQL queries.

### Optimization Tip
If you only care about the database order, sort by the ID field directly to avoid the display name overhead:
```python
# Fast (Integer sorting)
partners.sorted(key=lambda r: r.partner_id.id)

# Slow (String sorting via partner name)
partners.sorted(key='partner_id')
```

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
