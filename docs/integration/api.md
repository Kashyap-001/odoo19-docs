# External API: Connecting from the Outside

Sometimes you need to interact with Odoo from an external script, a legacy system, or a third-party application. Odoo provides a robust **XML-RPC** and **JSON-RPC** API for this exact purpose.

---

## 1. Why XML-RPC?

While Odoo's internal code is Python, the External API allows *any* language (PHP, Java, Node.js, Ruby) to talk to Odoo. In this guide, we'll use Python's `xmlrpc.client` as it is the most common way to write sync scripts.

### Visualizing the Connection

| Feature | Description |
| :--- | :--- |
| **Common URL** | `http://your-odoo-domain.com/xmlrpc/2/common` (For Auth) |
| **Object URL** | `http://your-odoo-domain.com/xmlrpc/2/object` (For Data) |
| **Protocol** | XML-RPC (Stateful, procedure-based) |

---

## 2. Authentication: Getting the UID

Before you can read or write data, you must prove who you are. Odoo requires four pieces of information:
1. **URL**: The server address.
2. **DB**: The database name.
3. **Username**: The user's email/login.
4. **Password**: The user's password (or API Key - recommended).

### ✅ Step 1: Login Script
```python
import xmlrpc.client

url = 'http://localhost:8069'
db = 'pways_auction'
username = 'admin'
password = 'your_api_password'

common = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/common')
uid = common.authenticate(db, username, password, {})

if uid:
    print(f"✅ Success! Your UID is: {uid}")
else:
    print("❌ Login failed.")
```

---

## 3. Interacting with Records

Once you have the `uid`, you can use the `execute_kw` method to call any model method (search, read, create, write, unlink).

### ✅ Step 2: Search & Read (The Pro Way)
Instead of fetching everything, always use `search_read` to filter and limit the fields returned.

```python
models = xmlrpc.client.ServerProxy(f'{url}/xmlrpc/2/object')

# Scenario: Get all 'Open' auction listings
listings = models.execute_kw(db, uid, password, 'auction.listing', 'search_read', [
    [('state', '=', 'open')] # Domain
], {
    'fields': ['name', 'current_price', 'end_date'], # Specific Fields
    'limit': 5 # Pagination
})

for item in listings:
    print(f"Listing: {item['name']} | Price: {item['current_price']}")
```

---

## 4. Common API Methods

| Method | Description | Example Usage |
| :--- | :--- | :--- |
| **`search`** | Returns a list of IDs matching a domain. | `[('is_seller', '=', True)]` |
| **`read`** | Returns field values for a list of IDs. | `[id1, id2], ['name']` |
| **`create`** | Creates a new record. Returns the new ID. | `{'name': 'New Bid'}` |
| **`write`** | Updates existing records. Returns True/False. | `[id], {'state': 'closed'}` |
| **`unlink`** | Deletes records. Returns True/False. | `[id]` |

---

## 5. Security Checklist for External APIs

1. **Use API Keys:** Never hardcode your actual user password. Generate an API Key in Odoo via *Settings > Users > [Your User] > Account Security*.
2. **Limit Permissions:** Create a dedicated "API User" with the minimum necessary access rights (ACLs).
3. **Use HTTPS:** XML-RPC sends data in plain text (encoded in XML). Always use an SSL-enabled URL (`https://`) in production.
4. **Batch Operations:** If creating many records, try to pass a list of dictionaries to `create` (if supported) rather than calling the API in a loop.

!!! tip "Native Python Library"
    For more complex integrations, consider using the [OdooRPC](https://pythonhosted.org/OdooRPC/) or [ERPEek](https://github.com/nantic/erpeek) libraries, which provide a more "Pythonic" wrapper around these raw XML-RPC calls.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
