---
title: Odoo 19 OWL Component Lifecycle
description: Master the OWL 2.0 component lifecycle. Understand setup, mounting, and patching for reactive UIs.
---

# Odoo 19: OWL Component Lifecycle

OWL components go through a strict lifecycle.

```mermaid
sequenceDiagram
    participant C as Component
    participant S as setup()
    participant M as mount()
    participant P as patch()
    
    C->>S: Initialize State/Services
    S->>M: DOM Insertion
    M->>P: Reactive Updates
```

### Master Project Challenge: OWL
1.  **Task**: Add a `useEffect` hook to your `AuctionTimer` component that logs "Component Mounted" on initialization.
2.  **Goal**: Understand when state becomes reactive in the lifecycle.
