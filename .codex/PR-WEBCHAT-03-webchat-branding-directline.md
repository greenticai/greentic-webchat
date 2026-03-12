# PR-WEBCHAT-03 — Preserve Microsoft Bot Framework while making WebChat tenant-aware

## Goal

Make the WebChat experience tenant-configurable without breaking Microsoft Bot Framework behaviour.

## Non-negotiables

- Microsoft Bot Framework WebChat must keep working.
- Inside chat, use standard Adaptive Cards only.
- No custom chat renderer that breaks Bot Framework semantics.

## Scope

### A. Tenant-specific DirectLine target

Move the DirectLine base URL / endpoint selection into tenant config.

Each tenant may point to a different backend.

### B. Tenant-specific WebChat style config

Allow tenant config to drive visual settings that Bot Framework/WebChat supports, for example:

- style options
- font family
- accent colour
- bubble/container palette where supported
- Adaptive Card host config / appearance where supported
- button alignment / spacing where supported

Important: stay within standard WebChat + Adaptive Card customization boundaries.

### C. Separate shell style from chat style

Keep the page shell highly brandable, but do not make unsupported custom changes inside the chat protocol/rendering layer.

### D. WebChat compatibility docs

Document clearly:

- what is safe to customize,
- what must remain standard,
- what tenant config is allowed to influence.

## Deliverables

- runtime WebChat config adapter
- tenant-to-WebChat mapping layer
- docs describing supported tenant style fields
- smoke test that boots WebChat for at least Greentic + one tenant sample

## Acceptance criteria

- WebChat boots using tenant-provided DirectLine config.
- Standard Adaptive Cards still render.
- Existing bot interaction does not regress.
- Tenant-specific visual config is applied only via supported hooks.
