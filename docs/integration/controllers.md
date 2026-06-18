# Odoo Controllers: Building Web Endpoints

Odoo is not just a backend ERP; it's a powerful web server. Controllers allow you to create custom HTTP routes, enabling you to build web portals, mobile app integrations, or public-facing APIs.

---

## 1. What is a Controller?

While Models handle data and Views handle the backend UI, **Controllers** handle HTTP requests. They map a URL (e.g., `/auction/status`) to a Python function.

### Visualizing the Flow

| Component | Responsibility | Analog |
| :--- | :--- | :--- |
| **Model** | Data Storage & Logic | The Chef |
| **View** | Backend Interface | The Kitchen |
| **Controller** | Handling Requests | The Waiter |

---

## 2. The `@http.route` Decorator

To create a route, you inherit from `http.Controller` and use the `@http.route` decorator.

### Basic Implementation

```python
from odoo import http
from odoo.http import request

class AuctionController(http.Controller):

    @http.route('/auction/hello', auth='public', type='http', website=True)
    def hello_world(self):
        return "<h1>Hello, Auction Hunter!</h1>"
```

### Key Parameters:
- **`route`**: The URL path. Can be a string or a list of strings.
- **`auth`**: Determines who can access the route (see below).
- **`type`**: Either `http` (returns HTML/text) or **`jsonrpc`** (returns a JSON object).
- **`website`**: Set to `True` if the route should be part of the Odoo Website ecosystem (enabling themes, menus, etc.).

---

## 🚀 Odoo 19: JSON-RPC 2.0 Standard

In Odoo 19, the legacy `type='json'` has been updated to `type='jsonrpc'`. This ensures compliance with the JSON-RPC 2.0 specification, providing better error handling and standardized response structures for external integrations.

---

---

## 3. Understanding Authentication Types

Authentication (`auth`) is the most critical part of controller security.

| Type | Description | Use Case |
| :--- | :--- | :--- |
| **`none`** | No database access. Extremely fast but limited. | Webhooks, Health checks. |
| **`public`** | Database access available. Uses the "Public User" if not logged in. | Storefronts, Public listings. |
| **`user`** | Requires a logged-in user. `request.env.user` is the current user. | Portals, My Account, Internal APIs. |

---

## 4. Creating a JSON API Endpoint

In Odoo 19, building a JSON API for a mobile app or a frontend framework (like React or Vue) is straightforward.

### ✅ The Professional Way (JSON Endpoint)

```python
@http.route('/auction/listing/info', type='json', auth='user')
def get_listing_info(self, listing_id):
    # 1. Fetch the record using the request environment
    listing = request.env['auction.listing'].browse(listing_id)
    
    if not listing.exists():
        return {'error': 'Listing not found'}

    # 2. Return a dictionary (Odoo automatically converts this to JSON)
    return {
        'id': listing.id,
        'name': listing.name,
        'current_price': listing.current_price,
        'end_date': listing.end_date,
        'bid_count': listing.bid_count,
    }
```

---

## 5. Handling Data: `request` Object

Inside a controller, you don't use `self.env`. Instead, you use the `request` object to interact with the database and session.

- **`request.env`**: The Odoo environment (like `self.env` in models).
- **`request.params`**: A dictionary containing GET and POST arguments.
- **`request.session`**: The current user session.
- **`request.render()`**: Used to return a QWeb template.

!!! danger "Security Warning"
    Always validate your inputs! Controllers bypass Odoo's standard form security. If you accept a `listing_id` from a URL, use `sudo()` only if strictly necessary, and always check if the user has permission to view that specific record.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
