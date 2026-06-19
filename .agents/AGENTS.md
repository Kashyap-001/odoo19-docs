# Project Rules: Odoo 19 Senior Masterclass Docs

## 🔍 Google Search Console & SEO Verification
When verifying site ownership or integrating search console tags for `*.workers.dev` subdomains:
*   **Property Type**: Use the **URL prefix** property option in Google Search Console, as DNS verification is not possible on shared subdomains.
*   **HTML File Verification**: Place the downloaded verification HTML file directly inside the `docs/` folder (e.g., `docs/googleef481eae7ea1f833.html`), not the project root. This ensures MkDocs compiles and copies it to the site root folder.
*   **HTML Tag Verification**: Inject the `<meta>` verification tag into the site `<head>` using MkDocs template overrides:
    1. Configure `custom_dir: overrides` under the `theme` key in `mkdocs.yml`.
    2. Create `overrides/main.html` extending `base.html` and place the tag inside the `extrahead` block.
    3. **Template Context Safety**: General templates (like `404.html`) are compiled without a `page` context (`page` is `None`). Always check if `page` exists (e.g., `{% if page %}`) before referencing page properties like `page.meta` or `page.title` in head overrides.
    4. **JSON Escaping**: When injecting page metadata (such as titles and descriptions) into JSON-LD scripts, always escape double quotes (e.g. `{{ page.title | replace('\"', '\\\"') }}`) to avoid JSON parsing exceptions.

## 🛠️ MkDocs Build and Navigation Integrity
*   **Nav Configuration**: Every Markdown file (`.md`) added to the `docs/` directory must be explicitly mapped under the `nav` key in `mkdocs.yml`.
*   **Verification**: Always run `./venv/bin/mkdocs build --strict` after modifying documentation structure to ensure all internal cross-links and navigation items are properly resolved.
*   **Content Preservation**: When splitting or refactoring documentation pages, verify that no information (including inline quizzes, code challenges, senior checkpoints, or breaking changes notes) is lost. Ensure the beginner-to-senior phase-based learning path remains logical.
*   **Lesson Layout Guidelines**: Interactive knowledge checks (quizzes with `.quiz-container` and code challenges with `.code-challenge`) must always reside at the very end of the lesson page, directly preceding the `## Related ...` guides (if present) and the feedback widget.
*   **Structural Parsers**: When parsing/restructuring markdown files in scripts, avoid general substring matching for headings (e.g., matching "related" anywhere in the line) as this can trigger false positives on main H1 page titles. Ensure matching is highly specific (e.g. level-2 headings starting with "Related").

## 🚀 Git & Deployment Constraints
*   **No Remote Deploys**: Do not run Wrangler deployment commands (e.g., `wrangler deploy`). Only compile/validate locally and commit all finalized changes cleanly to the local Git tree.
