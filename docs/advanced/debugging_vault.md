# The Debugging Vault (Odoo 19)

In Odoo development, debugging is not just about fixing errors; it's about understanding the state of the registry, the environment, and the database cursor. This vault contains the most common pitfalls and the tools to escape them.

---

## 1. Common Odoo 19 Tracebacks

### **Expected singleton: record.set(id, ...)**
This occurs when you attempt to access a field on a recordset containing multiple records (or zero records) when the logic expects exactly one.
*   **The Fix:** Use `.ensure_one()` to validate your assumption early.
```python
# Dangerous
def action_validate(self):
    print(self.name) # Fails if multiple records selected

# Safe
def action_validate(self):
    self.ensure_one()
    print(self.name)
```

### **Access Error: The requested operation cannot be completed...**
Odoo's security layer blocked the action. This could be an ACL (`ir.model.access.csv`) issue or a Record Rule (`ir.rule`).
*   **The Fix:** 
    1. Check if the model has a defined ACL for the user's group.
    2. Check `Settings > Technical > Record Rules` to see if a domain is filtering the record.
    3. If the action is truly internal, use `.sudo()`.

### **KeyError in cache**
Usually happens during installation or when the registry is out of sync. It means the ORM is looking for a field value in the local memory cache that doesn't exist.
*   **The Fix:** Often resolved by restarting the server with `-u module_name`. If it persists in code, ensure you aren't manually manipulating `self.env.cache` without proper invalidation.

---

## 2. Bottleneck Hunting: Profiler & Statistics

Odoo 19 provides built-in tools to identify slow SQL queries and heavy Python methods.

### **The Profiler**
You can profile specific code blocks to see exactly where time is spent.
```python
from odoo.tools.profiler import Profile

with Profile(self.env.cr.dbname) as profile:
    # Your slow code here
    self._compute_complex_logic()
```
The results will be logged or can be viewed in the backend under **Settings > Technical > Profiling**.

### **cr.statistics**
If you suspect SQL performance issues, use the cursor's statistics:
```python
self.env.cr.execute("SELECT ...")
# View query counts and times
print(self.env.cr.statistics) 
```

---

## 3. Troubleshooting OWL 2.0 Components

OWL 2.0 (used in Odoo 19) is stricter about lifecycle hooks.

### **Error: "Hook called outside of setup"**
In OWL 2.0, hooks like `onWillStart`, `onMounted`, or `useService` MUST be called directly within the `setup()` method of a component.
*   **The Error:**
```javascript
setup() {
    setTimeout(() => {
        onMounted(() => { ... }); // Error!
    }, 1000);
}
```
*   **The Fix:**
```javascript
setup() {
    onMounted(() => { ... }); // Correct
}
```

---

## 4. 💡 Senior Tip: Master the Log Levels

Don't just use `print()`. Proper logging allows you to filter noise in production and get deep insights in development.

| Level | Usage |
| :--- | :--- |
| `DEBUG` | Deep internal state. Use for loop iterations or complex calculations. |
| `INFO` | Standard flow (e.g., "Auction Started"). Default Odoo level. |
| `WARNING` | Something is off but not fatal (e.g., "Missing optional configuration"). |
| `ERROR` | Operation failed but the server stays alive. |
| `CRITICAL` | Server-wide failure. |

**Pro Tip:** Use `logging.getLogger(__name__)` to ensure your logs are prefixed with your module's path, making them easy to grep.

```python
import logging
_logger = logging.getLogger(__name__)

_logger.debug("Processing record %s", self.id)
```

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
