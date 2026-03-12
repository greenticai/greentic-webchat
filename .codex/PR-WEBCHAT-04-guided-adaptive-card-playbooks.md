# PR-WEBCHAT-04 — Add guided Adaptive Card playbooks based on the Zain network assistant patterns

## Goal

Bring the workshop-driven guided flow model into `greentic-webchat` using standard Adaptive Cards and a progressive menu hierarchy.

## UX model

Use progressive disclosure:

1. category menu
2. playbook list within category
3. guided multi-card flow

Do not render a single long flat list.

## Categories

### Network Traffic & Routing

- Prefix traffic distribution
- BGP advertisers and session health
- Top source ASNs

### Capacity & Port Management

- Free Gi ports
- Overutilised Gi ports
- Free ACI ports
- Overutilised ACI ports

### Performance & Root Cause

- VM performance RCA
- Noisy neighbour investigation
- Change correlation

### Service Assurance

- Service SLO / SLA status

## Flow pattern

Each playbook should follow the same broad structure:

1. scope card
2. understanding / parse card
3. data-source / routing card
4. retrieval card
5. analysis card
6. evidence card
7. summary card
8. next actions card (optional)

## Requirements

- standard Adaptive Cards only
- believable telecom sample values
- natural-language trigger mapping to the closest playbook
- reusable fixture layer for demo data
- playbook menu labels must be i18n-ready

## Acceptance criteria

- Guided menu hierarchy appears in chat.
- All listed playbooks can be launched.
- Cards remain standard and Bot Framework-compatible.
- Existing shell theme and tenanting still apply.
