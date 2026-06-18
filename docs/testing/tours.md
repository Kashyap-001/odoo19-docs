# UI Testing: HttpCase and Odoo Tours

While unit tests handle logic, **HttpCase** and **Tours** handle the user experience. They allow you to simulate a real user navigating through the browser, clicking buttons, and filling out forms.

## HttpCase: The Browser Controller

`HttpCase` is a specialized test class that can launch a headless browser (Chrome) to execute JavaScript tests.

```python
from odoo.tests import HttpCase, tagged

@tagged('post_install', '-at_install')
class TestAuctionTours(HttpCase):
    def test_portal_bidding_tour(self):
        self.start_tour("/", "auction_portal_tour", login="portal_user")
```

---

## Odoo Tours (JavaScript)

A Tour is a sequence of steps defined in JavaScript. It uses jQuery-like selectors to find elements and perform actions.

### Defining a Tour

Tours are usually defined in `static/tests/tours/`.

```javascript
/** @odoo-module **/
import { registry } from "@web/core/registry";

registry.category("web_tour.tours").add("auction_portal_tour", {
    url: "/my/auctions",
    steps: () => [
        {
            trigger: ".o_auction_listing_card:first a",
            content: "Click on the first auction listing",
            run: "click",
        },
        {
            trigger: "input[name='bid_amount']",
            content: "Enter a bid amount",
            run: "text 150.0",
        },
        {
            trigger: "button.place_bid",
            content: "Place the bid",
            run: "click",
        },
        {
            trigger: ".alert-success",
            content: "Verify success message is displayed",
        },
    ],
});
```

---

## How Tours Work

1. **Trigger:** A CSS selector that must be visible for the step to execute.
2. **Run:** The action to perform (e.g., `click`, `text 123`, `drag_and_drop`). If omitted, the tour simply waits for the trigger to appear.
3. **Content:** A descriptive tooltip shown during debugging.

!!! tip "Senior Tip: Deterministic Tours"
    Avoid using `time.sleep` or JS timeouts. Odoo's tour manager automatically waits for elements to appear and for RPC calls to complete. Use specific triggers like `.o_notification_manager:contains("Success")` to ensure the UI has finished updating before moving to the next step.

---

## Debugging Tours

You can run tours in the browser with the UI visible to debug them.
- Add `?debug=tests` to the URL.
- Open the **Test Menu** (in the debug icon) and select your tour.
- Watch as the tour executes each step with visual indicators.

---

## Verification in HttpCase

After a tour finishes, you can perform additional Python-side assertions in your `HttpCase` method to verify database changes.

```python
def test_portal_bidding_tour(self):
    self.start_tour("/", "auction_portal_tour", login="portal_user")
    
    # Check if the bid was actually created in the DB
    bid = self.env['auction.bid'].search([('amount', '=', 150.0)])
    self.assertTrue(bid, "Bid should have been created by the tour")
```

!!! tip "Senior Tip: UI State"
    Tours are expensive to run. Use them primarily for "happy path" integration testing of critical UI flows (like the bidding process). For edge cases in logic, stick to `TransactionCase`.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
