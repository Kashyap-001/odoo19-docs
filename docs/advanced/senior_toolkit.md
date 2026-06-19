---
title: Senior Odoo Architect's Toolkit - Extensions & Aliases
description: Boost your Odoo 19 development speed with the best VS Code extensions, CLI power aliases, and professional debugging tools.
---

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

<div class="cli-builder-container">
    <h3>🐚 Interactive Odoo 19 Command Builder</h3>
    <p>Select your task parameters below to instantly generate the correct terminal command.</p>
    <div class="cli-builder-grid">
        <div>
            <label for="cli-action">Task Action:</label>
            <select id="cli-action" onchange="generateCommand()">
                <option value="run">Run Odoo Server</option>
                <option value="update">Update / Install Module</option>
                <option value="test">Run Automated Unit Tests</option>
                <option value="shell">Launch Interactive Python Shell</option>
                <option value="mro">Inspect Class MRO (MRO Audit)</option>
            </select>
        </div>
        <div>
            <label for="cli-db">Database Name:</label>
            <input type="text" id="cli-db" value="my_database" oninput="generateCommand()">
        </div>
        <div id="cli-module-group">
            <label for="cli-module">Module Name(s) / Model Class:</label>
            <input type="text" id="cli-module" value="pways_auction" oninput="generateCommand()">
        </div>
    </div>
    <div class="cli-command-box">
        <code id="cli-command-output">python3 odoo-bin -c odoo.conf -d my_database</code>
        <button id="cli-copy-btn" onclick="copyCommand()">📋 Copy</button>
    </div>
</div>

<script>
function generateCommand() {
    const action = document.getElementById('cli-action').value;
    const db = document.getElementById('cli-db').value.trim() || 'my_database';
    const module = document.getElementById('cli-module').value.trim() || 'pways_auction';
    const output = document.getElementById('cli-command-output');
    const moduleGroup = document.getElementById('cli-module-group');
    
    if (action === 'run') {
        moduleGroup.style.opacity = '0.5';
        output.innerText = `python3 odoo-bin -c odoo.conf -d ${db}`;
    } else if (action === 'update') {
        moduleGroup.style.opacity = '1';
        output.innerText = `python3 odoo-bin -c odoo.conf -d ${db} -u ${module} --stop-after-init`;
    } else if (action === 'test') {
        moduleGroup.style.opacity = '1';
        output.innerText = `python3 odoo-bin -c odoo.conf -d ${db} -i ${module} --test-enable --stop-after-init`;
    } else if (action === 'shell') {
        moduleGroup.style.opacity = '0.5';
        output.innerText = `python3 odoo-bin shell -c odoo.conf -d ${db}`;
    } else if (action === 'mro') {
        moduleGroup.style.opacity = '1';
        output.innerText = `python3 odoo-bin shell -c odoo.conf -d ${db} --eval "print(self.env['${module}'].__class__.__mro__)"`;
    }
}

function copyCommand() {
    const cmd = document.getElementById('cli-command-output').innerText;
    navigator.clipboard.writeText(cmd).then(() => {
        const btn = document.getElementById('cli-copy-btn');
        btn.innerText = '✅ Copied!';
        setTimeout(() => { btn.innerText = '📋 Copy'; }, 2000);
    });
}

// Initial generation
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('cli-action')) {
        generateCommand();
    }
});
</script>

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
