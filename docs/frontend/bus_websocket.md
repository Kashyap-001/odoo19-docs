---
title: Odoo 19 Real-time: Bus & WebSocket
description: Learn how to leverage Odoo's Bus system and WebSockets for real-time updates in your Odoo 19 application.
---

# Odoo 19: Real-time Communication (Bus/WebSocket)

Odoo's Bus system allows different parts of the system (or even different users) to communicate in real-time. This is how features like Chat, Notifications, and Live Updates work.

---

## 1. The Bus Service
You can subscribe to channels and listen for messages in real-time using the `bus_service` in the frontend.

```javascript
// In your component
setup() {
    this.busService = useService("bus_service");
    this.busService.subscribe("my_channel", (payload) => {
        console.log("New message:", payload);
    });
}
```

---

## 2. 🏁 Senior Checkpoint
*   **Architect Insight:** Real-time updates are resource-intensive. Always ensure your channel subscriptions are cleaned up when a component is destroyed to avoid unnecessary load on the Bus system.
*   **Pro Tip:** For backend notifications to the frontend, use `self.env['bus.bus']._sendone()`.
