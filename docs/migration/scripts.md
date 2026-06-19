# Odoo Migration Scripts

Upgrading Odoo involves transforming the database schema and data from one version to another. Odoo provides a built-in mechanism to execute migration scripts automatically during a module update.

## Directory Structure

Migration scripts live inside a `migrations/` folder in your module. Odoo looks for folders named after the version you are migrating *to*.

```text
pways_auction/
├── migrations/
│   ├── 19.0.1.1/
│   │   ├── pre-migration.py
│   │   ├── post-migration.py
│   │   └── end-migration.py
```

## 1. Pre-Migration Scripts

Executed **before** Odoo loads the new module code. Use this to handle schema changes that would otherwise cause the Odoo loader to crash (e.g., renaming a column that Odoo expects to exist).

```python
# migrations/19.0.1.1/pre-migration.py

def migrate(cr, version):
    # Rename a column before Odoo tries to create a new one
    cr.execute("ALTER TABLE auction_listing RENAME COLUMN old_price TO starting_price")
```

!!! tip "Architect Tip: Avoid `env`"
    In `pre-migration`, the Registry is not yet initialized or is in an inconsistent state. **Never** use `env` or `self.env`. Always use raw SQL via `cr.execute()`.

## 2. Post-Migration Scripts

Executed **after** Odoo has updated the module's schema and loaded the new XML data. Use this for complex data transformations that require the new ORM logic.

```python
# migrations/19.0.1.1/post-migration.py
from odoo import api, SUPERUSER_ID

def migrate(cr, version):
    env = api.Environment(cr, SUPERUSER_ID, {})
    # Update new fields based on existing data
    listings = env['auction.listing'].search([])
    for listing in listings:
        listing.write({'migration_status': 'verified'})
```

## 3. End-Migration Scripts

Executed at the very end of the migration process for all modules. Used for cleanup or cross-module logic.

## Best Practices

| Rule | Reason |
| :--- | :--- |
| **Idempotency** | Scripts should be safe to run multiple times without error. |
| **Logging** | Use `logging.getLogger(__name__)` to track progress. |
| **SQL First** | If it can be done in SQL, do it in SQL. It's 100x faster than ORM. |

!!! tip "Architect Tip: OpenUpgrade"
    For major version upgrades (e.g., v18 to v19), study the `OpenUpgrade` library by the OCA. It provides powerful helpers for renaming fields, merging models, and handling common Odoo core changes.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Migrations evolve the database schema; Odoo supports `pre`, `post`, and `end` hooks.
*   **Architect Insight:** **Never** use the ORM (`env`) in pre-migration scripts; the registry is unstable. Always use raw SQL via `cr.execute()`.
*   **Verify Your Knowledge:** When does a `post-migration` script run? (Answer: After Odoo has updated the module schema and loaded the new XML data).

!!! success "Next Step"
    Database updated. Now [Profile your Performance](../advanced/performance_profiling.md) like a pro.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
