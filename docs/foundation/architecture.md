---
title: Odoo 19 Architecture Overview
description: Understand the 3-tier architecture of Odoo 19. Learn how Model, View, and Portal interact to create robust business applications.
---

# Odoo 19: Architecture Overview

To master Odoo, you must understand the 3-Tier Architecture.

```mermaid
graph TD
    A[User / Web Browser] -->|HTTP Request| B(Portal / Controller)
    B -->|RPC Call| C{ORM / Model}
    C -->|Database Operations| D[(PostgreSQL)]
    C -->|Return Result| B
    B -->|Render Template| A
    
    style C fill:#f96,stroke:#333,stroke-width:2px
```

### Master Project Challenge: Architecture
1.  **Task**: Diagram the interaction of your `auction.listing` model.
2.  **Goal**: Identify the Controller route that will handle the "Bid" action.
