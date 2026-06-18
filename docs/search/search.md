# Odoo Search & Domains

Searching for records is one of the most powerful features of the Odoo ORM. It uses a specific syntax called **Domains**.

## search()

The `search()` method finds records that match a specific criteria (domain) and returns a **recordset**.

```python
# Find all active auctions
auctions = self.env['auction.listing'].search([('state', '=', 'active')])
```

### Search Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| **domain** | list | The filter criteria (see below). |
| **limit** | int | Maximum number of records to return. |
| **offset** | int | Number of records to skip (for pagination). |
| **order** | str | Sorting string (e.g., `'name desc, id asc'`). |

---

## Understanding Domains

A domain is a list of conditions. Each condition is a tuple: `('field_name', 'operator', value)`.

### Implicit AND
By default, all conditions in a list are joined by an **AND**.
```python
# Name is 'Laptop' AND state is 'draft'
domain = [('name', '=', 'Laptop'), ('state', '=', 'draft')]
```

### Polish Notation (Prefix Logic)
Odoo uses Polish Notation for complex logic. The operator (`&`, `|`, `!`) comes **before** the conditions.

| Symbol | Logic | Usage Example |
| :--- | :--- | :--- |
| **`&`** | AND | `['&', (C1), (C2)]` (Default) |
| **`|`** | OR | `['|', (C1), (C2)]` |
| **`!`** | NOT | `['!', (C1)]` |

---

## Advanced Domain Operators (v19)

Odoo 19 introduces powerful new operators for relational fields (Many2many, One2many).

| Operator | Meaning | Use Case |
| :--- | :--- | :--- |
| **`any!`** | Matches records where **any** child matches. | `[('tag_ids', 'any!', [('name', '=', 'Tech')])]` |
| **`not any!`** | Matches records where **no** child matches. | `[('tag_ids', 'not any!', [('name', '=', 'Draft')])]` |

!!! info "Pro Tip: any! vs in"
    While `in` matches against a list of IDs, `any!` allows you to pass a **nested domain** to filter based on child attributes, making it significantly more flexible for complex relational queries.

---

## Programmatic Domains (The Domain Class)

In Odoo 19, you can now construct domains as objects using the `Domain` class. This is much safer and more readable than manual list manipulation.

```python
from odoo.osv.expression import Domain

# Create a domain object
domain = Domain([('state', '=', 'open')])

# Easily combine domains with operators
if premium_only:
    domain &= Domain([('price', '>', 1000)])
else:
    domain |= Domain([('is_featured', '=', True)])

# Use it in search
results = self.env['auction.listing'].search(domain)
```

---

## Comparison Operators

| Operator | Meaning | Example |
| :--- | :--- | :--- |
| **`=`** | Equals | `[('state', '=', 'open')]` |
| **`!=`** | Not Equals | `[('state', '!=', 'closed')]` |
| **`>`**, **`<`** | Greater/Less Than | `[('price', '>', 100)]` |
| **`in`** | Is in list | `[('state', 'in', ['draft', 'sent'])]` |
| **`like`** | Case-sensitive contains | `[('name', 'like', 'Auction')]` |
| **`ilike`** | Case-insensitive contains | `[('name', 'ilike', 'auction')]` |

---

## 🚀 Odoo 19: Relational Operators (any! / not any!)

Standard domains often struggle with "deep" relational filtering. Odoo 19 introduces **`any!`** and **`not any!`** for precise control over One2many and Many2many fields.

### Why use any!?
Instead of just checking if a child ID exists, `any!` allows you to check for **attributes** of the child record in a single domain.

```python
# Find auctions where ANY bid is higher than 1000 AND the bidder is verified
domain = [('bid_ids', 'any!', [('amount', '>', 1000), ('is_verified', '=', True)])]
```

### Why use not any!?
Find parent records where **none** of the children match a specific condition.
```python
# Find auctions where NO bids have been canceled
domain = [('bid_ids', 'not any!', [('state', '=', 'canceled')])]
```

---

## Senior: Overriding Search Methods

To customize how Odoo searches for records (e.g., when typing in a Many2one field), you can override the internal search methods.

### 1. `_name_search()`
Used to define how Odoo looks up records based on a search string (e.g., in the autocomplete dropdown).

```python
@api.model
def _name_search(self, name, domain=None, operator='ilike', limit=100, order=None):
    # Search by Name OR by internal Reference Code
    domain = domain or []
    if name:
        name_domain = ['|', ('name', operator, name), ('ref', operator, name)]
        domain = expression.AND([domain, name_domain])
    return self._search(domain, limit=limit, order=order)
```

### 2. `_search()`
The low-level hook for all search operations. Overriding this allows you to inject security domains or complex filtering logic that cannot be expressed in standard Record Rules.

---

## Common Mistakes

!!! danger "Common Mistakes to Avoid"
    1. **Searching on Unindexed Fields**: Slows down the database on large tables.
    2. **Using len(search())**: Use `search_count(domain)` instead for better performance.
    3. **Forgetting sudo()**: Record Rules might hide records you need for system logic.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Domains use Polish Notation (`&`, `|`, `!`) to build SQL WHERE clauses.
*   **Architect Insight:** Overriding `_name_search` is the standard way to provide multi-field search (e.g., Name OR Code) in Many2one dropdowns.
*   **Verify Your Knowledge:** What is the difference between `ilike` and `like`? (Answer: `ilike` is case-insensitive, while `like` is case-sensitive).

!!! success "Next Step"
    Standard search is good. High-performance apps use [search_fetch()](../crud/search_fetch.md).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
