---
title: Odoo 19 Error Handling: UserError vs ValidationError
description: Master Odoo 19 exception handling. Learn when to use UserError, ValidationError, AccessError, and RedirectWarning for best UX.
---

# Exceptions & Error Handling

... (Check [Security & ACLs](../business/security.md) for how permissions trigger errors.)

In Odoo, exceptions are not just for debugging—they are a primary way to communicate with the user and enforce business rules. Using the wrong exception type can lead to confusing UI messages.

---

## 1. The Core Exceptions

Odoo provides a specialized set of exceptions in `odoo.exceptions`.

| Exception | Purpose | UI Result |
| :--- | :--- | :--- |
| **`UserError`** | Business logic violation (e.g., "You can't close an empty auction"). | Yellow Warning Modal |
| **`ValidationError`** | Data integrity violation (e.g., "Price must be positive"). | Red Error Modal |
| **`AccessError`** | Permission denied. | Red Error Modal |
| **`MissingError`** | Record not found (usually deleted by someone else). | Red Error Modal |
| **`RedirectWarning`** | Error with a button to fix the problem. | Warning with Button |

---

## 2. UserError vs. ValidationError vs. AccessError

This is the most common point of confusion for beginners. Selecting the correct exception determines how Odoo stops the transaction and what message the user sees.

### `UserError` (Business Logic Violations)
Use this for errors that are **not** related to field constraints, but rather to the **state** of the system. Odoo shows a friendly **Yellow Warning Box**.
```python
from odoo.exceptions import UserError

def action_confirm(self):
    if not self.bid_ids:
        raise UserError("An auction must have at least one bid before it can be confirmed.")
```

### `ValidationError` (Data Integrity Constraints)
Use this inside `@api.constrains` or when a field value itself is invalid. Odoo shows a strict **Red Error Box**.
```python
from odoo.exceptions import ValidationError

@api.constrains('start_price')
def _check_price(self):
    if self.start_price <= 0:
        raise ValidationError("The starting price must be strictly positive.")
```

### `AccessError` (Security & Permissions)
Raised automatically by Odoo's ACL system, but can be manually triggered when a security rule is violated. Shows a **Red Access Denied Modal**.
```python
from odoo.exceptions import AccessError

def action_delete_auction(self):
    if self.seller_id != self.env.user:
        raise AccessError("You can only delete your own auctions.")
```

---

## 3. Security & Integrity: Access & Missing Errors

These exceptions are often raised automatically by Odoo, but senior developers use them to manually enforce high-level security.

### `AccessError` (Permissions)
Raised when a user tries to perform an action they aren't allowed to do (e.g., a Seller trying to delete another Seller's auction).
```python
from odoo.exceptions import AccessError

def action_delete_auction(self):
    if self.seller_id != self.env.user:
        raise AccessError("You can only delete your own auctions.")
```

### `MissingError` (Data Sync)
Raised when you try to access a record that no longer exists in the database.
```python
from odoo.exceptions import MissingError

def process_queued_bid(self, bid_id):
    bid = self.env['auction.bid'].browse(bid_id)
    if not bid.exists():
        raise MissingError("The bid you are trying to process was recently deleted.")
```

---

## 4. Actionable Errors: `RedirectWarning`

Sometimes, telling the user they made a mistake isn't enough—you should help them fix it. `RedirectWarning` allows you to provide a button that triggers an Odoo Action (like opening their profile).

```python
from odoo.exceptions import RedirectWarning

def action_bid(self):
    if not self.env.user.partner_id.email:
        action = self.env.ref('base.action_res_users_my_profile').id
        raise RedirectWarning(
            "You must set an email on your profile to place a bid.",
            action, 
            "Go to My Profile"
        )
```

---

## 4. Senior: Custom Exceptions

As an architect, you may want to catch specific types of errors in your integration logic. You can create custom exception classes by inheriting from `UserError`.

```python
class AuctionClosedError(UserError):
    """Raised when an action is attempted on a closed auction."""
    pass

# Usage
if auction.state == 'closed':
    raise AuctionClosedError("This auction is already closed!")
```

!!! tip "Architect Insight"
    Never use generic Python `Exception` or `ValueError` to communicate with the user. These will show as "Internal Server Error" (500) and provide a poor user experience. Always use Odoo's built-in exception classes.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Odoo exceptions map directly to UI components (Yellow warnings vs Red errors).
*   **Architect Insight:** `RedirectWarning` is the gold standard for UX; it reduces support tickets by guiding users to the solution.
*   **Verify Your Knowledge:** Which exception should you use inside an `@api.constrains` method? (Answer: `ValidationError`).

---

## 📝 Knowledge Check

<div class="quiz-container">
  <div class="quiz-question">1. Which exception displays a yellow warning box that allows the user to continue after clicking OK?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="The `UserError` exception." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">2. When should you use `RedirectWarning` instead of `UserError`?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="When you can provide a specific action (button) for the user to take to resolve the error." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">3. What is the technical difference between raising a `UserError` and a standard Python `ValueError`?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="`UserError` is caught by Odoo and displayed as a user-friendly modal; `ValueError` is treated as a crash (Internal Server Error)." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

<div class="quiz-container">
  <div class="quiz-question">4. Why is `ValidationError` usually associated with the `@api.constrains` decorator?</div>
  <input type="text" class="quiz-input" placeholder="Type your answer here...">
  <button class="quiz-check" data-answer="Because it specifically signals that a data integrity rule has been violated during the create or write process." onclick="checkQuiz(this)">Check Answer</button>
  <div class="quiz-result"></div>
</div>

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
