# Odoo Mixins: mail.thread & mail.activity

Mixins are **Abstract Models** that provide "off-the-shelf" functionality to any model that inherits them. The most powerful mixins in Odoo are found in the `mail` module.

---

## 1. The Chatter Mixin (`mail.thread`)

The `mail.thread` mixin provides the "Chatter" or "Log" section at the bottom of a form view. It allows users to send messages, log notes, and track field changes.

### Step 1: Python Inheritance
To use it, your model must inherit from `mail.thread`.

```python
class AuctionListing(models.Model):
    _name = 'auction.listing'
    _inherit = ['mail.thread'] # Inherit the mixin

    # tracking=True enables field logging in the Chatter
    name = fields.Char(string="Title", tracking=True)
    state = fields.Selection(..., tracking=True)
```

### Step 2: XML View
You must add the `<chatter/>` component to the bottom of your `<form>` view (inside the `<sheet>` is optional, but usually placed after it).

```xml
<form>
    <sheet>
        <!-- Your fields here -->
    </sheet>
    <chatter/> <!-- This renders the entire Chatter UI -->
</form>
```

---

## 2. The Activity Mixin (`mail.activity.mixin`)

This mixin adds "Activities" (Tasks, Meetings, Phone Calls) to your model. It usually goes hand-in-hand with `mail.thread`.

### Step 1: Python Inheritance
```python
class AuctionListing(models.Model):
    _name = 'auction.listing'
    _inherit = ['mail.thread', 'mail.activity.mixin']
```

### Step 2: XML Integration
The `<chatter/>` component automatically includes activities if the model inherits the mixin. No extra XML tags are needed, but you can add an **Activity View** (see [Advanced Views](../foundation/advanced_views.md)).

---

## 3. How Mixins Work (The Senior View)

When you inherit from `mail.thread`, Odoo performs **Classical Inheritance**. It adds several technical fields and methods to your model behind the scenes:

- **`message_ids`**: A `One2many` link to all messages/notes.
- **`message_follower_ids`**: A `Many2many` link to users/partners following the record.
- **`message_post()`**: A Python method you can call to programmatically send messages.

### Example: Automated Posting
```python
def action_approve(self):
    self.write({'state': 'approved'})
    # Post a message to the Chatter automatically
    self.message_post(body="This auction has been approved and is now live!", 
                     message_type='notification')
```

---

## 🏁 Senior Checkpoint
*   **Key Concept:** `mail.thread` provides the Chatter UI and field tracking; `mail.activity.mixin` handles scheduling.
*   **Architect Insight:** Inheritance of mixins is the fastest way to add professional "Enterprise" features to your custom modules.
*   **Verify Your Knowledge:** What happens if you add `tracking=True` to a field but forget to inherit from `mail.thread`? (Answer: Odoo will ignore the attribute, and no changes will be logged).

!!! success "Next Step"
    Communication is key. Now manage unique identifiers with [Sequences](sequences.md).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
