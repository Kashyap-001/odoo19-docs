# Odoo Read Operations

In Odoo, reading data is done through recordsets. You can access fields directly, browse records by ID, or use the `read()` method for specific data structures.

## Direct Field Access

```mermaid
graph TD
    Input[IDs or Domain] --> Proc{Method?}
    
    Proc -- browse --> RS[Recordset]
    Proc -- search --> DB[(Database)]
    DB --> RS
    
    RS --> Dot[Dot Notation]
    RS --> Read[read method]
    
    Dot --> Value[Single Field Value]
    Read --> Dict[List of Dictionaries]
```

Once you have a recordset, you can access its fields using dot notation. This is the most common way to "read" data in Odoo.

```python
# Assuming 'record' is a single record
print(record.name)
print(record.partner_id.city)  # Chained access
```

### The Power of Prefetching
Odoo is smart. When you access a field on one record in a loop, it automatically fetches that field for all other records in the recordset to improve performance and avoid "N+1" query problems.

---

## browse()

The `browse()` method takes database IDs and returns a **recordset**. It does not execute a query immediately; it creates an object that will fetch data when you access its fields.

### Example: Single ID
```python
# Returns a single record
partner = self.env['res.partner'].browse(42)
```

### Example: List of IDs
```python
# Returns a recordset of multiple records
partners = self.env['res.partner'].browse([1, 2, 3])
```

---

## read()

The `read()` method is used when you need a list of dictionaries containing specific field values. This is often used for API responses or when you want to bypass the overhead of recordset objects.

### Syntax
`records.read([fields])`

### Example
```python
partners = self.env['res.partner'].search([('is_company', '=', True)])
data = partners.read(['name', 'email', 'city'])

# Output:
# [
#   {'id': 1, 'name': 'Azure Interior', 'email': 'azure@example.com', 'city': 'San Francisco'},
#   {'id': 2, 'name': 'Deco Addict', 'email': 'deco@example.com', 'city': 'Paris'}
# ]
```

---

## Summary Table

| Method | Returns | Best Used For... |
| :--- | :--- | :--- |
| **Dot Notation** | Field Value | Standard business logic and UI templates. |
| **`browse()`** | Recordset | When you have IDs and need to perform ORM operations. |
| **`read()`** | List of Dicts | External integrations, performance-critical raw data. |

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Odoo's prefetching engine makes field access on recordsets extremely efficient.
*   **Architect Insight:** `browse()` is "Lazy"; it doesn't hit the database until you access a field. `read()` is "Eager" and returns raw dictionaries.
*   **Verify Your Knowledge:** When should you use `read()` over dot notation? (Answer: When building an API or a controller where you need raw JSON-friendly data).

!!! success "Next Step"
    Reading is done. Now learn to [Modify Records](write.md) using the write method.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
