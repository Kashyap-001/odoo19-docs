# 🚀 Odoo 18 to Odoo 19: The Migration Delta

This guide tracks the critical technical changes between Odoo 18 and 19. If you are migrating a module or preparing for v19 development, these are the "Senior" breaking changes you must know.

---

## 🏗️ Core Framework & ORM

### 1. `SQL()` Wrapper is Now Mandatory
The old `cr.execute(f"SELECT ...")` style is deprecated in favor of the `SQL()` wrapper to prevent SQL injection and handle parameter formatting automatically.
- **v18**: `cr.execute("SELECT id FROM table WHERE name = %s", (name,))`
- **v19**: `self.env.cr.execute(SQL("SELECT id FROM %I WHERE name = %s", table, name))`

### 2. Search & Fetch Optimization
The `search_fetch()` method is now the preferred way to retrieve data for performance.
- **Why**: It combines searching and reading into a single database trip, reducing round-trips for large recordsets.

### 3. Recordset `copy()` Behavior
Strict validation has been added to `copy_data()`. Default values in `_inherits` are handled more explicitly to prevent data leakage between original and duplicate records.

---

## 🎨 Frontend & OWL 2.0

### 1. Removal of Legacy Widget Mixins
Several legacy `Widget` and `Class` mixins from v15/v16 that were still supported in v18 have been fully removed. All frontend logic must now be pure OWL components.

### 2. `bus_service` Enhancements
The `bus_service` now supports more granular channel subscriptions, allowing for better real-time updates in multi-company environments without overloading the long-polling server.

### 3. Strict Prop Validation
OWL 2.0 in Odoo 19 enforces stricter `props` validation. Components passing undeclared props will now throw explicit warnings in the developer console.

---

## 🛠️ View & UI Changes

### 1. `<searchpanel>` Performance
The `searchpanel` has been refactored to use lazy-loading by default. For large datasets (like thousands of categories), this significantly improves view load time.

### 2. Advanced View XML Syntax
- **Graph Views**: New attributes for better controlling stack behavior.
- **Pivot Views**: Enhanced `disable_linking` logic for security-sensitive data.

---

## 📝 Senior Migration Checklist
1. [ ] Audit all custom SQL queries and wrap them in `SQL()`.
2. [ ] Replace `search().read()` patterns with `search_fetch()`.
3. [ ] Verify OWL component props against the new 2.0 schema.
4. [ ] Test multi-company record access in the new `bus_service` channels.

---
*Stay ahead of the curve. Odoo 19 is about performance and security.*
