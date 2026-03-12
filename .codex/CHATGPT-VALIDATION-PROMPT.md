# ChatGPT validation prompt — review greentic-webchat migration plan / implementation

Validate the following migration for `greentic-webchat`.

## Context

This app must be migrated to support:

- remote `product.json` + `tenant.json`
- tenant resolution by subdomain or path
- Greentic fallback tenant
- config-driven login buttons
- dummy login
- real OIDC redirects
- large locale dropdown with native names
- browser language used as the initial default locale before any user override
- locale fallback `variant -> base -> en`
- RTL for Arabic variants
- tenant-driven navigation
- tenant-driven DirectLine backend
- tenant-driven WebChat / Adaptive Card visual config
- guided telecom playbooks in standard Adaptive Cards
- preservation of Microsoft Bot Framework WebChat compatibility

## Inputs

Paste below:

1. current-state audit
2. zain-network intake notes
3. file touch map
4. implementation delta
5. risk register
6. staged PR plan
7. if validating post-change, the actual changed files and test results

## What to validate

Please review and answer these questions:

1. Is the migration sequence safe, or should the order change?
2. What Microsoft Bot Framework / Adaptive Card compatibility risks remain?
3. What auth/OIDC edge cases are likely to be missed?
4. What i18n/locale/RTL pitfalls remain?
5. What tenant-resolution or remote-config pitfalls remain?
6. What tests are missing?
7. What rollback / fallback behaviour is missing?
8. Which parts are too coupled and should be split further?
9. Are any requirements from the workshop-style guided playbooks missing?
10. Is there any place where the plan accidentally hardcodes product/tenant assumptions instead of loading from config?
11. Does the locale plan correctly use the browser language as the initial default while still allowing explicit user persistence/override?

## Required output format

Return:

### A. Overall verdict
- green / amber / red

### B. Top 10 risks

### C. Recommended changes before implementation/merge

### D. Test checklist

### E. Compatibility checklist specific to Microsoft Bot Framework

### F. Any missing requirement you believe should be added now rather than later
