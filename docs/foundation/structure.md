# Addon Structure

Understand the file organization of a professional Odoo 19 module.

## The Standard Directory Layout

Every Odoo addon follows a specific structure to ensure the platform can discover and load its components correctly.

```text
my_module/
├── __init__.py           # Python package entry point
├── __manifest__.py       # Module metadata and configuration
├── models/               # Database structure (Python files)
│   ├── __init__.py
│   └── my_model.py
├── views/                # User interface (XML files)
│   └── my_view.xml
├── security/             # Access rights and record rules
│   └── ir.model.access.csv
├── data/                 # Initial/Demo data (XML/CSV)
└── static/               # Assets (JS, CSS, Images)
```

---

## The Manifest File (`__manifest__.py`)

This is the most important file in your module. It tells Odoo the name, version, and dependencies of your addon.

### Example Manifest
```python
{
    'name': 'Auction Marketplace',
    'version': '1.0',
    'category': 'Sales',
    'summary': 'Manage real-time auctions',
    'depends': ['base', 'product', 'mail'],
    'data': [
        'security/ir.model.access.csv',
        'views/auction_listing_views.xml',
    ],
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
```

!!! info "Important"
    The order of files in the `data` list matters. Security files should generally be loaded before views.

---

## Blueprint: Standard Module Skeleton

When starting a new Odoo 19 project, consistency is key. Below is the recommended `__manifest__.py` blueprint that includes modern Odoo 19 defaults.

```python
{
    'name': 'Modern Auction',
    'version': '1.0',
    'category': 'Sales/Auction',
    'summary': 'Professional Auction Management for Odoo 19',
    'description': """
        - Real-time bidding (OWL)
        - Multi-currency support
        - Anti-sniping logic
    """,
    'author': 'Senior Architect',
    'depends': ['base', 'product', 'mail', 'bus'],
    'data': [
        'security/ir.model.access.csv',
        'security/auction_security.xml',
        'views/auction_listing_views.xml',
        'data/cron.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'pways_auction/static/src/components/**/*'
        ],
    },
    'installable': True,
    'application': True,
    'license': 'LGPL-3',
}
```

<button class="quiz-check" onclick="copyBlueprint()">Copy Manifest Blueprint</button>

---

## Folder Breakdown

### `models/`
Contains the Python files defining your database tables. Each file should be imported in the `models/__init__.py`.

### `views/`
Contains XML files that define how your data is displayed (Forms, Lists, Search views).

### `security/`
The `ir.model.access.csv` file defines who can read, write, create, or delete records in your models.

### `static/`
Stores frontend assets. In Odoo 19, this is where your **OWL (Odoo Window Library)** components live.

---

## Initializing Python Packages

Don't forget the `__init__.py` files!
*   Root `__init__.py`: Imports the `models` folder.
*   `models/__init__.py`: Imports individual Python files.

```python
# In my_module/__init__.py
from . import models
```

---

## 🚀 Odoo 19 Hook Refactor

In Odoo 19, the lifecycle hooks defined in your `__manifest__.py` (like `post_init_hook`) have been modernized.

**Previous Versions:** Received the raw database cursor (`cr`).
**Odoo 19:** Now receive the full Environment (`env`).

### Why this matters:
You no longer need to manually create an environment using `api.Environment(cr, SUPERUSER_ID, {})`. You can access models directly!

```python
# __init__.py
def post_init_hook(env):
    # 'env' is already initialized and ready!
    env['res.partner'].create({'name': 'Auction House Admin'})
```

---

## 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. What is the purpose of the `__manifest__.py` file?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="It contains the module's metadata, dependencies, and a list of data files to be loaded." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">2. Why does the order of files in the `data` list of the manifest matter?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="Files are loaded sequentially; for example, security files must be loaded before views that depend on those models to avoid errors." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">3. Which folder is used to store frontend assets like JavaScript and CSS?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="The `static/` folder." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">4. What happens if you forget to import a subfolder or file in `__init__.py`?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="Odoo will not be able to find or load the Python code in that folder or file, meaning models won't be created in the database." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Odoo modules are Python packages with a mandatory `__manifest__.py` file.
*   **Architect Insight:** Proper folder structure (models, views, security) is not just a convention—it is critical for multi-developer collaboration and upgradeability.
*   **Verify Your Knowledge:** What happens if you forget to import a model file in `models/__init__.py`? (Answer: Odoo will not create the database table for that model).

!!! success "Next Step"
    Structure is clear. Now let's [Define your first Model](models.md).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
