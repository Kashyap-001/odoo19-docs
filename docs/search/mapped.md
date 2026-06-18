# Odoo mapped() Method

The `mapped()` method is used to transform a recordset into a list of values or a new recordset. It is a powerful way to extract specific fields or traverse relationships without using loops.

---

## Simple Fields

You can use `mapped()` to get a list of values for a specific field from all records in a recordset.

### Example
Get a list of all names from a recordset of partners:

```python
names = partners.mapped('name')
# Output: ['Alice', 'Bob', 'Charlie']
```

---

## Relational Fields

`mapped()` can also traverse relational fields (Many2one, One2many, Many2many) using dot notation.

### Example
Get all the cities of the partners' companies:

```python
cities = partners.mapped('company_id.city')
# Output: ['New York', 'Paris', 'New York']
```

!!! note "Recordsets vs Lists"
    If the field being mapped is a **relational field**, `mapped()` returns a **recordset**. If it is a **simple field** (like Char, Integer, Float), it returns a **Python list**.

---

## Getting Unique Values

If you want to ensure the resulting list or recordset contains unique values, you can use the `mapped()` method followed by a set operation, or traverse unique relations.

### Example: Unique Partner Names from Orders
To get a unique list of partner names who have placed orders in your recordset:

```python
# 'orders' is a recordset of sale.order
partner_names = orders.mapped('partner_id.name')

# To make them unique in Python:
unique_names = list(set(partner_names))
```

!!! tip "Unique Recordsets"
    When mapping to relational fields, Odoo automatically handles the recordset to keep it unique if you use dot notation on a recordset.
    ```python
    # Returns a unique recordset of partners
    partners = orders.mapped('partner_id') 
    ```

---

## Why use mapped()?

1.  **Readability:** It replaces "for loops" with a single line of code.
2.  **Efficiency:** It is optimized for Odoo recordsets.
3.  **Clean Code:** Makes your business logic easier to follow.

---

## Senior: Prefetching & Performance

When you use `mapped('relational_field.name')`, Odoo's prefetching engine automatically loads the `relational_field` data for **all** records in the recordset in a single SQL query.

### The "Dot Notation" Magic
```python
# Even if 'partners' has 1000 records, this only triggers TWO queries:
# 1. Fetch 'company_id' for all 1000 partners.
# 2. Fetch 'city' for all unique companies.
cities = partners.mapped('company_id.city')
```

!!! danger "Deep Traversals"
    Avoid extremely deep traversals (e.g., `mapped('a.b.c.d.e.name')`) in loops. Each dot represents a potential relational hop that, while prefetched, increases memory pressure and complexity of the resulting SQL JOIN.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** `mapped`, `filtered`, and `sorted` allow Python-style manipulation of Odoo recordsets.
*   **Architect Insight:** `mapped` on relational fields returns a **unique recordset**, making it a "De-duplicator" by default.
*   **Verify Your Knowledge:** Does `mapped` return a list or a recordset for a Many2one field? (Answer: A recordset).

!!! success "Next Step"
    Recordsets mastered. Now leverage [AI Automation](../business/actions.md) in your business logic.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
