# 🛠️ The Senior Architect's Toolkit

Being a Senior Odoo Architect isn't just about code; it's about the tools you use to build faster and more reliably. Here is the exact setup used for professional Odoo 19 development.

---

## 💻 VS Code Essentials
If you aren't using these extensions, you're working too hard.

| Extension | Purpose |
| :--- | :--- |
| **Odoo Snippets** | Instant boilerplate for Models, Views, and Actions. |
| **Pylance** | High-performance type checking for Odoo recordsets. |
| **XML Tools** | Auto-formatting and XPath validation. |
| **Error Lens** | See Odoo traceback hints directly in your code. |

---

## 🐚 CLI Power Aliases
Stop typing long commands. Add these to your `.bashrc` or `.zshrc`.

```bash
# Quick Start & Update
alias odoo-up="python3 odoo-bin -c odoo.conf -u"

# Fast Module Refresh (Usage: odoo-mod my_module)
odoo-mod() { python3 odoo-bin -c odoo.conf -u $1 --stop-after-init; }

# Clear Cache & Restart
alias odoo-clear="find . -name '*.pyc' -delete && rm -rf ~/.cache/pip"
```

---

## 🔍 Debugging Like a Pro

### 1. The `breakpoint()` Trick
In Odoo 19, use the native Python `breakpoint()` inside any method. It works perfectly with the Odoo shell.

### 2. OWL DevTools
Install the **OWL Inspector** (Chrome/Firefox). It allows you to:
- Inspect component `state` and `props` in real-time.
- Trigger OWL events manually to test UI behavior.

---

## 📦 Recommended Environment
- **Python**: 3.12+
- **PostgreSQL**: 16+
- **Node.js**: 20+ (for OWL/JS linting)
- **Docker**: For testing against different Odoo versions without polluting your local machine.

---
*Tip: A Senior developer spends 30% of their time improving their tools and 70% building features.*
