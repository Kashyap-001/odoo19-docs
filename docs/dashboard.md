---
title: Progress Dashboard — Odoo 19 Masterclass Learning Path
description: Track your progress throughout the 10-phase Odoo 19 Senior Masterclass developer training program.
---

# Odoo 19 Masterclass: Progress Dashboard

Welcome to your Senior Architect journey. Use this page to track your progress through the Odoo 19 curriculum. 

<div id="global-progress-container">
    <div id="global-progress-fill"></div>
    <div id="global-progress-text">Mastery: 0% (0/0 Lessons)</div>
</div>

<div class="backup-restore-container">
    <button class="backup-btn" onclick="exportProgress()">📤 Export Progress Backup</button>
    <button class="backup-btn" onclick="document.getElementById('import-file').click()">📥 Import Progress Backup</button>
    <input type="file" id="import-file" style="display: none;" onchange="importProgress(this)" accept=".json">
</div>

---

## Phase 1: The Foundations 🏗️
*Building the skeletal structure of an Odoo application.*

| Lesson | Core Skill | Senior Insight | Status |
| :--- | :--- | :--- | :---: |
| [Architecture](foundation/architecture.md) | 3-Tier System | Real-time Bus Logic | [ ] |
| [Environment Setup](foundation/setup.md) | Python 3.12 / Odoo 19 | Docker Orchestration | [ ] |
| [Defining Models](foundation/models.md) | Table Mapping | models.Constraint | [ ] |
| [Basic Fields](foundation/fields_basic.md) | Standard Types | translatable & monetary | [ ] |
| [Relational Fields](foundation/fields_relational.md) | Database Links | Command namespace | [ ] |
| [Advanced Field Logic](foundation/fields_advanced.md) | Functional fields | compute_sudo / groups | [ ] |
| [XML Data Engine](foundation/data_files.md) | Record IDs | dynamic eval | [ ] |
| [Security (ACL)](business/security.md) | CRUD Permissions | Public vs. User | [ ] |
| [List Views](foundation/views_list.md) | Grid aggregations | decoration / editable | [ ] |
| [Form Views](foundation/views_form.md) | Sheet design | get_views() hook | [ ] |
| [Kanban Views](foundation/views_kanban.md) | Card pipelines | card layout shift | [ ] |

---

## Phase 2: The Art of Inheritance 🧩
*Modifying and extending existing systems without breaking them.*

| Lesson | Core Skill | Senior Insight | Status |
| :--- | :--- | :--- | :---: |
| [Model Inheritance](business/inheritance.md) | _inherit vs _inherits | Prototype & Oversight Flow | [ ] |
| [XPath & View Overrides](foundation/xpath.md) | XML Patching | mode="inner" | [ ] |
| [Record Rules](business/rules.md) | Row-level Security | allowed_company_ids | [ ] |

---

## Phase 3: The ORM Engine 🛠️
*Writing high-performance business logic.*

| Lesson | Core Skill | Senior Insight | Status |
| :--- | :--- | :--- | :---: |
| [Environment Mastery](env/context.md) | Sudo & Context | Cache Management | [ ] |
| [CRUD Operations](crud/index.md) | Lifecycle | Batch Patterns | [ ] |
| [Create Logic](crud/create.md) | Batch Insertion | Command Class | [ ] |
| [Read & Browse](crud/read.md) | browse() vs read() | Prefetching | [ ] |
| [Update & Delete](crud/write.md) | write() & unlink() | Soft Delete Patterns | [ ] |
| [Modern search_fetch](crud/search_fetch.md) | v19 Optimization | SQL-level field limits | [ ] |

---

## Phase 4: Business Intelligence 🧠
*Advanced logic, Wizards, and automated workflows.*

| Lesson | Core Skill | Senior Insight | Status |
| :--- | :--- | :--- | :---: |
| [Decorators (@api)](advanced/decorators.md) | Depends/Onchange | Recomputation Logic | [ ] |
| [Wizards](wizards/wizards.md) | TransientModels | State Persistence | [ ] |
| [Actions & AI](business/actions.md) | Server Actions | Prompt Engineering | [ ] |
| [Search Domains](search/search.md) | Polish Notation | _name_search override | [ ] |
| [Performance & Set Operations](search/performance_optimization.md) | mapped/filtered/sorted | filtered_domain | [ ] |

---

## Phase 5: Modern Frontend (OWL) 🌐
*Building reactive, component-based UIs.*

| Lesson | Core Skill | Senior Insight | Status |
| :--- | :--- | :--- | :---: |
| [OWL 2.0 Basics](frontend/owl.md) | Components & Hooks | Lifecycle Hooks | [ ] |
| [Reactive State](advanced_owl/store.md) | Shared Stores | Event Bus vs. Store | [ ] |
| [Patching Components](advanced_owl/patching.md) | Global Overrides | super() in JS | [ ] |
| [QWeb & Reports](frontend/reports.md) | v19 PDF Engine | Performance Tuning | [ ] |

---

## Phase 6: Professional Quality 🧪
*Ensuring stability through automated testing.*

| Lesson | Core Skill | Senior Insight | Status |
| :--- | :--- | :--- | :---: |
| [Unit Testing](testing/unit_tests.md) | TransactionCase | Mocking & Patching | [ ] |
| [UI Tours](testing/tours.md) | Browser Simulation | JS Testing | [ ] |
| [UI Customization](advanced/ui_display.md) | display_name | compute_display_name | [ ] |

---

## Phase 7: External Integration 🔌
*Connecting Odoo to the outside world.*

| Lesson | Core Skill | Senior Insight | Status |
| :--- | :--- | :--- | :---: |
| [Web Controllers](integration/controllers.md) | Routing & JSON | CSRF Security | [ ] |
| [External API](integration/api.md) | XML-RPC / JSON-RPC | Key-based Auth | [ ] |
| [API Performance](integration/performance.md) | Rate Limiting | Batch API calls | [ ] |

---

## Phase 8: Multi-Company & Portal 🏢
*Enterprise-scale architecture.*

| Lesson | Core Skill | Senior Insight | Status |
| :--- | :--- | :--- | :---: |
| [Multi-Company Logic](multi_company/logic.md) | Company Isolation | record_rules + company | [ ] |
| [Website Integration](multi_company/website.md) | Multi-website | slug() & SEO | [ ] |

---

## Phase 9: Senior Ops & Migration 🚀
*Deployment, scaling, and data lifecycle.*

| Lesson | Core Skill | Senior Insight | Status |
| :--- | :--- | :--- | :---: |
| [Docker Mastery](deployment/docker.md) | Containerization | Multi-stage Builds | [ ] |
| [Scaling](deployment/scaling.md) | Multi-node setup | Pgbouncer & Redis | [ ] |
| [Migration Scripts](migration/scripts.md) | OpenUpgrade | SQL post-scripts | [ ] |
| [Performance Profiling](advanced/performance_profiling.md) | Profiler/Speedscope | SQL Optimization | [ ] |

---

## Phase 10: Career & Standards 🎓
*Mastering professional habits and high-level strategy.*

| Lesson | Core Skill | Senior Insight | Status |
| :--- | :--- | :--- | :---: |
| [Senior Toolkit](advanced/senior_toolkit.md) | SOPs & Git | Code Review Mastery | [ ] |
| [Debugging Vault](advanced/debugging_vault.md) | Traceback Analysis | OWL 2.0 Debugging | [ ] |
| [Migration Sheet](migration/cheat_sheet.md) | v18 → v19 | Syntax Refactoring | [ ] |

---

!!! success "Certification"
    Once all checkboxes are filled, you have completed the equivalent of 3 years of Odoo development experience. You are now a **Senior Odoo Architect**.

<div class="cert-container">
    <div class="cert-text">
        <h3>Claim Your Certificate</h3>
        <p>Unlocked only after 100% completion of the curriculum.</p>
    </div>
    <button id="claim-certificate-btn" onclick="generateCertificate()" disabled>Claim Architect Certificate</button>
</div>

---

## 🏗️ The Final Assembly: `pways_auction`

Congratulations on building the Master Project! Below is the complete directory structure of the professional Auction Marketplace you've built. Use this as a blueprint for all your future Odoo 19 modules.

```text
pways_auction/
├── __init__.py
├── __manifest__.py               # Core dependencies and asset bundles
├── i18n/
│   ├── pways_auction.pot         # Translation templates
│   └── fr.po                     # French translations
├── security/
│   ├── ir.model.access.csv       # ACLs for Managers and Bidders
│   └── auction_security.xml      # Record rules & Groups
├── data/
│   └── cron.xml                  # Scheduled action to close auctions
├── models/
│   ├── __init__.py
│   ├── auction_listing.py        # Core model with constraints & indexes
│   └── auction_bid.py            # Bid logic and relation to listing
├── wizard/
│   ├── __init__.py
│   ├── cancel_auction.py         # TransientModel for manual cancellation
│   └── cancel_auction_view.xml
├── views/
│   ├── auction_menus.xml         # App root menu
│   ├── auction_listing_views.xml # List, Form, and Kanban <card> views
│   └── auction_bid_views.xml
├── static/
│   └── src/
│       ├── components/
│       │   ├── bid_ticker.js     # OWL component for live prices
│       │   └── bid_ticker.xml
│       └── store/
│           └── auction_store.js  # Reactive state and Bus service
└── tests/
    ├── __init__.py
    └── test_auction_bids.py      # TransactionCase for bid validation
```

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
