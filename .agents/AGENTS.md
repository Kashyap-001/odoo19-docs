# Project Rules: Odoo 19 Senior Masterclass Docs

## 🔍 Google Search Console & SEO Verification
When verifying site ownership or integrating search console tags for `*.workers.dev` subdomains:
*   **Property Type**: Use the **URL prefix** property option in Google Search Console, as DNS verification is not possible on shared subdomains.
*   **HTML File Verification**: Place the downloaded verification HTML file directly inside the `docs/` folder (e.g., `docs/googleef481eae7ea1f833.html`), not the project root. This ensures MkDocs compiles and copies it to the site root folder.
*   **HTML Tag Verification**: Inject the `<meta>` verification tag into the site `<head>` using MkDocs template overrides:
    1. Configure `custom_dir: overrides` under the `theme` key in `mkdocs.yml`.
    2. Create `overrides/main.html` extending `base.html` and place the tag inside the `extrahead` block.

## 🛠️ MkDocs Build and Navigation Integrity
*   **Nav Configuration**: Every Markdown file (`.md`) added to the `docs/` directory must be explicitly mapped under the `nav` key in `mkdocs.yml`.
*   **Verification**: Always run `./venv/bin/mkdocs build --strict` after modifying documentation structure to ensure all internal cross-links and navigation items are properly resolved.
*   **Content Preservation**: When splitting or refactoring documentation pages, verify that no information (including inline quizzes, code challenges, senior checkpoints, or breaking changes notes) is lost. Ensure the beginner-to-senior phase-based learning path remains logical.

## 🚀 Git & Deployment Constraints
*   **No Remote Deploys**: Do not run Wrangler deployment commands (e.g., `wrangler deploy`). Only compile/validate locally and commit all finalized changes cleanly to the local Git tree.
