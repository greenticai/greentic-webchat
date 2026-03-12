# WebChat Tenant Config

This document defines the PR-03 adapter boundary between `tenant.json` and the existing Bot Framework WebChat boot path.

## What tenant config may influence

Supported `tenant.json` fields under `webchat`:

- `directline.token_url`: token endpoint used before `createDirectLine`
- `directline.domain`: optional Direct Line domain passed into `createDirectLine`
- `style_options_url`: optional replacement for the legacy `skin.webchat.styleOptions` JSON
- `style_options`: additive overrides merged into WebChat `styleOptions`
- `adaptive_cards_host_config_url`: optional replacement for the legacy host config JSON
- `adaptive_cards_host_config`: additive overrides merged into the Adaptive Cards host config
- `locale`: default WebChat locale when the shell does not override it

Legacy alias still accepted:

- `directline_url`
- `adaptive_card_style`

## What remains standard

- WebChat still loads from the official Microsoft CDN.
- `createDirectLine` still uses standard Bot Framework semantics.
- `renderWebChat` still mounts through the same DOM seam.
- Adaptive Cards remain standard Adaptive Cards only.
- Tenant hooks remain optional and unchanged; PR-03 does not expand their responsibilities.

## Merge behavior

- `skin.json` remains the bridge and source of base assets.
- Tenant config may replace the base JSON URL for `styleOptions` or host config.
- Inline tenant overrides are deep-merged onto the fetched base JSON.
- Arrays are replaced, not concatenated.

## Effective resolution order

For WebChat boot inputs:

1. base legacy `skin.json`
2. tenant `webchat.*_url` replacement if present
3. tenant inline `webchat.style_options`
4. tenant inline `webchat.adaptive_cards_host_config`
5. shell locale override, otherwise tenant `webchat.locale`, otherwise skin locale

For Direct Line:

1. tenant `webchat.directline.token_url` if present
2. legacy `skin.directLine.tokenUrl`
3. query-string `?directline=` override for local testing

If `?directline=` looks like a Direct Line domain instead of a token endpoint, the configured token URL is still used and the override is passed as the `domain`.

## Out of scope for this adapter

- custom activity rendering
- custom Adaptive Card renderer replacements
- tenant-specific React chat components
- guided playbook UI
