---
tags:
  - i18n
  - Global
  - Architecture
  - Odoo 19
---

# Translations (i18n) & Global Readiness

Odoo is a truly global platform. As a Senior Developer, you must ensure that every string displayed to the user can be translated into any language. Odoo handles this using the `i18n` (internationalization) system.

---

## 1. The Translation Marker `_()`

In Python, you should never hardcode English strings that will be shown to the user (like error messages). Instead, wrap them in the `_()` function.

### Importing the Marker
```python title="models/auction_bid.py"
from odoo import models, fields, api, _
from odoo.exceptions import UserError

class AuctionBid(models.Model):
    # ...

    @api.constrains('amount')
    def _check_amount(self):
        for bid in self:
            if bid.amount <= 0:
                # Use _() to mark the string for translation
                raise UserError(_("Bid amount must be strictly positive."))
```

### What happens behind the scenes?
When you export translations, Odoo scans your python files for `_("Text")` and extracts "Text" into a translation file. At runtime, if the user's language is French, Odoo replaces the English string with the French equivalent before raising the error.

---

## 2. Formatting Translated Strings

**Never** use python f-strings or string concatenation *inside* the translation marker. It breaks the translation system because the string changes dynamically.

### ❌ The Bad Way
```python
# The translator will see a different string every time the amount changes!
raise UserError(_(f"Your bid of {bid.amount} is too low."))
```

### ✅ The Professional Way
Use standard `%s` or `.format()` formatting *outside* the `_()` marker.

```python
# The translator sees exactly: "Your bid of %s is too low."
raise UserError(_("Your bid of %s is too low.") % bid.amount)
```

---

## 3. Translating XML and JS

### XML Files
You do not need to do anything special for XML files (views, data, reports). Odoo automatically extracts the text content of tags, as well as specific attributes like `string`, `help`, and `placeholder`.

```xml
<!-- "Confirm Bid" and "Please enter amount" are automatically extracted -->
<button string="Confirm Bid" type="object"/>
<field name="amount" placeholder="Please enter amount"/>
```

### JavaScript / OWL
In OWL components, use the `_t` function from the `@web/core/l10n/translation` module.

```javascript title="static/src/bid_component.js"
import { _t } from "@web/core/l10n/translation";

// ...
notification.add(_t("Bid placed successfully!"), { type: "success" });
```

---

## 4. The `.pot` File

Once your module is built, you generate a `.pot` (Portable Object Template) file. This file contains all the English strings found in your module.

You can generate this via the UI:
1. Go to **Settings > Translations > Export Translation**.
2. Select your module and click Export.
3. Place the downloaded `.pot` file into an `i18n/` folder inside your module.

Translators will copy this `.pot` file to create language-specific files (e.g., `fr.po` for French, `es.po` for Spanish).

---

## 🏁 Senior Checkpoint
*   **Key Concept:** Wrap all user-facing Python and JS strings in translation markers (`_()` or `_t()`).
*   **Architect Insight:** Never use f-strings inside translation markers. Translators need static templates with placeholders (`%s`).
*   **Verify Your Knowledge:** Do you need to wrap `string="Name"` in an XML field with a special tag? (Answer: No, Odoo extracts XML strings automatically).

!!! success "Next Step"
    Your module is global. Now let's explore [UI Customization](ui_display.md).

---

<div class="feedback-container">
    <span class="feedback-label">Was this page helpful?</span>
    <div class="feedback-buttons">
        <button class="feedback-btn" onclick="sendFeedback(true)">👍 Yes</button>
        <button class="feedback-btn" onclick="sendFeedback(false)">👎 No</button>
    </div>
</div>
