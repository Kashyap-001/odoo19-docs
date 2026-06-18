# Odoo 19 Unit Testing: Masterclass

In Odoo, unit tests are the backbone of a stable enterprise application. They ensure that business logic remains correct as the codebase evolves. Odoo 19 continues to leverage `unittest` with specialized classes like `TransactionCase`.

## The TransactionCase Class

```mermaid
sequenceDiagram
    participant O as Odoo Runner
    participant T as TransactionCase
    participant DB as PostgreSQL

    O->>T: setUpClass()
    T->>DB: CREATE Shared Data
    DB-->>T: Data Persistent (for this class)
    
    Loop Every test_xxx method
        O->>T: setUp()
        T->>DB: BEGIN TRANSACTION
        O->>T: test_method()
        T->>DB: ROLLBACK
        DB-->>T: Clean State
    end
    
    O->>T: tearDownClass()
```

`TransactionCase` is the most common test class in Odoo. Each test method runs in its own transaction, which is rolled back after execution, ensuring a clean state for every test.

### Basic Structure

```python title="tests/test_auction_listing.py"
from odoo.tests.common import TransactionCase

class TestAuctionListing(TransactionCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        # Create common data once for all test methods
        cls.seller = cls.env['res.users'].create({
            'name': 'Verified Seller',
            'login': 'seller@example.com',
        })
        cls.listing = cls.env['auction.listing'].create({
            'name': 'Vintage Watch',
            'seller_id': cls.seller.id,
            'initial_price': 100.0,
        })

    def test_initial_state(self):
        """ Verify the default state of a new listing """
        self.assertEqual(self.listing.state, 'draft')
        self.assertEqual(self.listing.bid_count, 0)
```

!!! tip "Senior Tip: Data Isolation"
    Always use `setUpClass` for data that is shared across all tests in the class. It significantly improves performance by reducing database hits. Use `setUp` (without classmethod) only if you need a fresh record per test method.

---

## 2. Specialized Test Classes

While `TransactionCase` handles 90% of your needs, Odoo provides other classes for specific scenarios.

### `HttpCase` (Web & Integration)
Inherit from `HttpCase` when you need to test controllers, website routes, or run **JavaScript Tours**.
- **Features:** Provides a built-in browser (`Chrome`), session management, and `self.url_open()`.
- **Transaction:** Unlike `TransactionCase`, it does **not** automatically rollback by default (it uses its own transaction management).

```python
from odoo.tests import HttpCase

class TestAuctionWeb(HttpCase):
    def test_listing_page(self):
        # Open the public listing page and check for 200 OK
        response = self.url_open('/auction/listings')
        self.assertEqual(response.status_code, 200)
```

### `SavepointCase` (Legacy/Internal)
You may see `SavepointCase` in older Odoo code. 
- **The Shift:** In modern Odoo 19, `TransactionCase` has been optimized to handle the heavy lifting that `SavepointCase` used to do.
- **Architect Note:** For new modules, always prefer `TransactionCase` unless you are maintaining legacy v12/v13 code.

---

## 3. Mocking and Patching

Sometimes you need to simulate external services or bypass complex logic. Odoo uses the standard `unittest.mock` library.

### Mocking Example

```python title="tests/test_auction_external.py"
from unittest.mock import patch

def test_external_api_call(self):
    with patch('odoo.addons.pways_auction.models.auction_listing.ExternalService.call') as mocked_call:
        mocked_call.return_value = {'status': 'success'}
        result = self.listing.validate_externally()
        self.assertTrue(result)
        mocked_call.assert_called_once()
```

---

## Testing Exceptions with `assertRaises`

Testing that your code fails correctly is just as important as testing that it succeeds. Use `with self.assertRaises` to catch expected exceptions.

```python title="tests/test_auction_bid.py"
from odoo.exceptions import ValidationError

def test_invalid_bid_amount(self):
    """ Ensure a bid lower than the current price raises an error """
    with self.assertRaises(ValidationError), self.cr.savepoint():
        self.env['auction.bid'].create({
            'listing_id': self.listing.id,
            'amount': 50.0,  # Less than initial_price 100.0
        })
```

!!! warning "Note on Savepoints"
    When using `assertRaises` inside a `TransactionCase`, always wrap the call in `self.cr.savepoint()`. This prevents the "Transaction broken" error from spilling over into subsequent tests.

---

## Running Tests via the CLI

Writing tests is only half the battle; knowing how to execute them efficiently without crashing your main database is critical.

### The Basic Command
To run tests, you must tell Odoo to update the module (`-u`) and enable the test runner (`--test-enable`). The `--stop-after-init` flag ensures the server shuts down immediately after the tests finish.

```bash
./odoo-bin -c odoo.conf -d my_test_db -u pways_auction --test-enable --stop-after-init
```

### Tag Filtering (`--test-tags`)
Running the entire test suite can take hours. As a developer, you usually only want to run the specific test you are working on.

**1. Run a specific module:**
```bash
./odoo-bin ... --test-tags /pways_auction
```

**2. Run a specific class:**
```bash
./odoo-bin ... --test-tags /pways_auction:TestAuctionBidding
```

**3. Run a specific method:**
```bash
./odoo-bin ... --test-tags /pways_auction:TestAuctionBidding.test_invalid_low_bid
```

### Interpreting the Output
When tests run, you should look for the `odoo.tests` logger in the console output.
- **`INFO` / `OK`**: The test passed.
- **`WARNING`**: A test was skipped (e.g., using `@unittest.skip`).
- **`ERROR`**: A test failed (an assertion was false) or crashed (a Python error occurred).

To see only test results and hide standard Odoo startup logs, append `--log-level=test` to your command.

---

## Senior: CI/CD Pipeline Integration

Professional teams never rely solely on developers running tests locally. Tests must run automatically on every Pull Request.

### Example: GitHub Actions YAML
This is a standard template for running Odoo tests in an isolated CI environment using Docker.

```yaml
name: Odoo 19 Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: odoo
          POSTGRES_PASSWORD: odoo
          POSTGRES_DB: postgres
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install Odoo Requirements
        run: pip install -r https://raw.githubusercontent.com/odoo/odoo/19.0/requirements.txt
      - name: Run Tests
        run: |
          git clone --depth 1 --branch 19.0 https://github.com/odoo/odoo.git odoo_src
          python odoo_src/odoo-bin -d test_db --db_host=localhost --db_user=odoo --db_password=odoo -i base,pways_auction --test-enable --stop-after-init --log-level=test
```

!!! tip "Architect Tip: Coverage"
    Aim for 80%+ coverage on business logic models. Don't waste time testing Odoo's core framework; focus on your custom `@api.depends`, `@api.constrains`, and action methods.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** `TransactionCase` ensures each test method runs in a dedicated transaction that is rolled back.
*   **Architect Insight:** Use `setUpClass` to create shared test data once; it saves minutes of execution time in large test suites.
*   **Verify Your Knowledge:** Why should you wrap `assertRaises` in `self.cr.savepoint()`? (Answer: To prevent a "broken transaction" error from affecting subsequent tests in the same suite).

!!! success "Next Step"
    Unit tests are solid. Now master [UI Tours](tours.md) to test your frontend.

---

## 🛠️ Master Project Challenge: Bulletproof Bids
We can't afford bugs in the bidding logic.

**Goal:** Write a test case in `TransactionCase`.
1.  Create a test auction listing in `setUpClass`.
2.  Write a test that attempts to place a bid **lower** than the starting price.
3.  Verify that it raises a `ValidationError` using `assertRaises`.

??? success "Show Solution"
    ```python title="tests/test_auction.py"
    from odoo.tests.common import TransactionCase
    from odoo.exceptions import ValidationError

    class TestAuctionBidding(TransactionCase):
        @classmethod
        def setUpClass(cls):
            super().setUpClass()
            cls.listing = cls.env['auction.listing'].create({
                'name': 'Vintage Lamp',
                'current_price': 50.0,
            })

        def test_invalid_low_bid(self):
            """Test that placing a bid lower than current price raises ValidationError."""
            with self.assertRaises(ValidationError), self.cr.savepoint():
                self.env['auction.bid'].create({
                    'listing_id': self.listing.id,
                    'amount': 20.0,
                })
    ```

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
