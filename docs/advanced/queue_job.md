---
title: Odoo Asynchronous Processing: OCA queue_job
description: Learn how to configure and use the OCA queue_job module in Odoo 19 to handle background tasks, job retries, channels, and asynchronous queue processing.
---

# OCA queue_job: Asynchronous Background Processing

In a standard Odoo setup, when a user triggers an action (like validating an order or syncing products with an external system), the worker thread is blocked until the operation completes. If the task is heavy, the browser connection can timeout, resulting in a poor user experience.

The **OCA `queue_job`** framework is the community-standard solution for offloading long-running, CPU-intensive, or external integration tasks to background workers.

```mermaid
graph TD
    Method[Business Method invoked] --> Delay[with_delay() execution modifier]
    Delay --> Queue[Queue Job database entry created]
    Queue --> Worker[Worker Thread picks up job]
    Worker --> Execution[Job execution runs in background]
```

---

## 1. Defining a Job

To define a background job, use the **`@job`** decorator from `odoo.addons.queue_job.job`.

```python
from odoo import models, fields
from odoo.addons.queue_job.job import job

class AuctionListing(models.Model):
    _inherit = 'auction.listing'

    @job
    def action_sync_external_auction(self):
        """Heavy API integration job to sync auction with eBay/Stripe"""
        self.ensure_one()
        # Perform API calls, data transformations, etc.
        ...
```

---

## 2. Enqueuing a Job: `with_delay()`

To trigger a method as a background task, call **`with_delay()`** before invoking it.

```python
def button_sync(self):
    # Instead of running synchronously, this inserts a record into 'queue.job'
    # and returns immediately, unblocking the user's browser.
    self.with_delay().action_sync_external_auction()
```

### Specifying Delay Parameters
You can customize priority and execution parameters on the fly:
```python
# Run with high priority (lower number = higher priority)
self.with_delay(priority=10).action_sync_external_auction()

# Delay execution by 10 minutes
self.with_delay(eta=600).action_sync_external_auction()
```

---

## 3. Channels and Concurrency Throttling

To prevent background jobs from overwhelming external APIs or locking the database, `queue_job` organizes tasks into **Channels**.

*   Channels are hierarchical paths (e.g. `root.sync.ebay`).
*   You can set concurrency limits on each channel (e.g. "Only run 2 eBay sync jobs at the same time").

### Registering a Job to a Channel
In your model definition, you associate jobs with channels:

```python
@job(default_channel='root.auction.sync')
def action_sync_external_auction(self):
    ...
```

---

## 4. Retries and Failure Handling

Integrations fail often due to external network drops. `queue_job` provides robust built-in retry mechanisms.

### Automatic Retries with Exponential Backoff
Configure retries in the decorator to handle transient network errors:

```python
# Retry up to 5 times. Wait 10s * retry_number between attempts.
@job(retry_pattern={1: 10, 2: 20, 3: 40, 4: 80, 5: 160})
def action_sync_external_auction(self):
    ...
```

### Manual Intervention (The Queue Job Dashboard)
If a job exceeds its maximum retries, its state changes to **Failed**. 
*   Administrators can review failed jobs under **Settings > Technical > Queue Job > Jobs**.
*   The dashboard shows the exact traceback of the failure.
*   Once resolved (e.g. updating credentials), admins can click **Requeue** to run the job again.

---

## 5. Configuration: `odoo.conf`

To run `queue_job`, you must configure your Odoo server configuration file to load the queue runner.

```ini
[options]
# 1. Add queue_job to server wide modules
server_wide_modules = web,queue_job

# 2. Configure the Queue Job runner options
[queue_job]
channels = root:2,root.auction.sync:1
```

*   `root:2`: Allows up to 2 concurrent jobs globally.
*   `root.auction.sync:1`: Limits the auction sync channel to 1 concurrent job to avoid race conditions.

---

## 🏁 Senior Checkpoint

*   **Key Concept**: `queue_job` writes jobs to the database; a background thread picks them up, ensuring task execution persists even if the server restarts.
*   **Architect Insight**: Never call `with_delay()` inside standard write operations if it can trigger a recursion loop. Always trigger delays from controller actions or user buttons.
*   **Verify Your Knowledge**: What happens if a background job modifies records and crashes? (Answer: The database transaction is rolled back, just like a standard HTTP request, and the job status is set to 'failed').

---

## 💻 Code Challenge

**Queue a background email notification to the winner of an auction with priority 20:**

<div class="code-challenge">
<pre><code>self.<input type="text" class="quiz-input-inline w-120" data-answer="with_delay(priority=20)">.action_notify_winner()
</code></pre>
<button class="quiz-check" onclick="checkCodeChallenge(this)">Check Code</button>
<div class="quiz-result"></div>
</div>

---
