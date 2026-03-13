# Guided Playbooks

PR-04 adds a legacy guided playbook demo layer on top of Microsoft Bot Framework WebChat without replacing the chat renderer.

## Safety boundary

- Playbooks are emitted as standard Bot Framework message activities.
- Cards use the standard Adaptive Card attachment content type.
- No custom React chat card renderer is introduced.
- Tenant hooks remain optional and unchanged.

## Flow model

1. category menu
2. playbook list within category
3. guided multi-card flow

Each launched playbook emits a fixed adaptive-card sequence:

1. scope
2. understanding
3. data sources
4. retrieval
5. analysis
6. evidence
7. summary

## Trigger model

- On first WebChat connect, the category menu is injected into chat.
- Adaptive Card submit actions launch either the next menu level or a playbook flow.
- Simple natural-language matching can route messages like `show bgp session health` to the closest playbook.

## Current limits

- The playbook layer is legacy demo-only and should only be enabled in local dev with `?demo=true`.
- Production behavior should come from the Direct Line backend, not from this repo.
- The `demo=true` path is intentionally marked as legacy so it can be deleted later.
- It does not call live telecom backends yet.
- If a user message does not match a playbook, the message continues through the normal bot path.
