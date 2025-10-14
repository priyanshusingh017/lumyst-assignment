# Lumyst SWE Internship Task Submission

Candidate: Priyanshu Singh  
Email: singhpriyanshu661930@gmail.com  
Date: October 15, 2025

## Task 1 — Find Bugs (Completed)

This repository contains documentation for four meaningful bugs identified in the Lumyst VS Code extension (v0.3.0): one critical security issue, one high-severity functional bug, and two medium-severity performance issues.

### Bugs identified

1. Iframe sandbox security vulnerability (CRITICAL)
2. Export analysis fails without .gitignore (HIGH)
3. Non-passive touch event listeners (MEDIUM)
4. document.write() deprecated API usage (MEDIUM)

### Repository contents

- `TASK1_BUG_REPORT.md` — Primary deliverable with full details for all four bugs
- `GOOGLE_DOC_TEMPLATE.md` — Ready-to-copy template for the official submission
- `TESTING_GUIDE.md` — Steps and checklist used during testing
- `logs/full_console_log.txt` — Representative console output used as evidence
- `screenshots/` — Empty folder for optional screenshots (not required)

### Testing methodology (summary)

- Installed and exercised the Lumyst extension in VS Code
- Monitored Developer Tools console throughout testing
- Ran multiple full analyses on the sample project
- Tested edge cases (e.g., workspace without a .gitignore)
- Captured logs and reproduced issues consistently

### Submission notes

- The primary report is `TASK1_BUG_REPORT.md`.
- If a Google Doc is required, copy content from `GOOGLE_DOC_TEMPLATE.md`.
- Screenshots are optional; add them under `screenshots/` if desired.

---

Guidance: Bugs reported here are actual issues (security, functional, or performance). Design choices or minor cosmetic preferences are not included. Each bug includes reproduction steps, environment details, logs, and recommended fixes.

