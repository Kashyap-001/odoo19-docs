---
title: Odoo 19 Server Configuration Tutorial — odoo.conf Parameters
description: Complete guide to configuring the Odoo 19 server. Customize ports, worker allocations, database filters, logging levels, and directories.
---

# Odoo Configuration Deep Dive

Mastering the `odoo.conf` file is the difference between a sluggish instance and a high-performance ERP.

## The Configuration File

The `odoo.conf` file controls how the server interacts with the OS and Database.

### Core Port Settings (v19 Update)
In Odoo 19, the legacy `xmlrpc_port` has been officially superseded by `http_port` to better reflect the modern web-first architecture.

| Legacy Parameter | New v19 Parameter | Description |
| :--- | :--- | :--- |
| `xmlrpc_port` | **`http_port`** | The main port for HTTP traffic (Default: 8069). |
| `longpolling_port` | `gevent_port` | Port used for websocket and chat (Default: 8072). |

### Performance Parameters

The most critical settings for production are the worker-related limits.

| Parameter | Description | Recommended |
| :--- | :--- | :--- |
| `workers` | Number of HTTP processes. | `(CPUs * 2) + 1` |
| `limit_memory_hard` | Max RAM before process is killed. | `2048MB` |
| `limit_memory_soft` | Max RAM before process is recycled. | `640MB` |
| `http_port` | The port Odoo listens on. | `8069` |

!!! tip "Architect Tip: The Worker Formula"
    Do not over-allocate workers. If you have 4 CPU cores, set `workers = 9`. However, ensure your PostgreSQL `max_connections` is at least `(workers * 2) + 5`.

## Nginx Reverse Proxy

In production, Odoo should never be exposed directly. Use Nginx to handle SSL, caching, and long-polling.

### Sample Nginx Configuration (v19)

```nginx
# Odoo Upstreams
upstream odoo { server 127.0.0.1:8069; } # Points to http_port
upstream odoochat { server 127.0.0.1:8072; }

server {
    listen 80;
    server_name auction.example.com;

    # Handle Standard Traffic
    location / {
        proxy_pass http://odoo;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Handle Websocket (Chat/Live Updates)
    location /websocket {
        proxy_pass http://odoochat;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

!!! tip "Architect Tip: Proxy Mode"
    Always set `proxy_mode = True` in your `odoo.conf`. Without this, Odoo will ignore the `X-Forwarded-*` headers, leading to incorrect IP logging and session issues.

---

## Odoo.sh vs. Self-Hosted (Docker)

Choosing the right hosting platform is a critical architectural decision.

| Feature | Odoo.sh (PaaS) | Self-Hosted (IaaS/Docker) |
| :--- | :--- | :--- |
| **Ease of Setup** | 1-Click Deployment | Manual Configuration |
| **Maintenance** | Managed by Odoo | Managed by You |
| **Customization** | Standard Modules + Addons | Full OS-level Control |
| **CI/CD** | Built-in (Automatic) | Custom (GitHub Actions/Jenkins) |
| **Cost** | Per Worker/User | Variable (Server Cost) |
| **Best For** | SME Projects / Rapid Dev | Enterprise / High Performance |

### When to choose Odoo.sh?
Use Odoo.sh if you want a "batteries-included" experience. It handles the database, backups, and staging environments for you. It is the gold standard for most Odoo implementations.

### When to choose Self-Hosted Docker?
Use Docker if you need specific OS-level dependencies (e.g., custom Python libs not on Odoo.sh), complex horizontal scaling, or if you must keep data on your own private infrastructure for compliance.

---

## 🏁 Senior Checkpoint
*   **Key Concept:** `odoo.conf` is the source of truth for server performance and networking.
*   **Architect Insight:** `proxy_mode = True` is the most important production setting; without it, Nginx headers are ignored, breaking SSL and user IP tracking.
*   **Verify Your Knowledge:** What is the formula for calculating `workers`? (Answer: `(CPU * 2) + 1`).

!!! success "Next Step"
    Config is tuned. Now [Containerize your Stack](docker.md) using Docker.

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
