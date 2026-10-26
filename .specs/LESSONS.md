# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - Conferir git diff --check contra a baseline da release antes da promoção, mesmo quando o checkout está limpo.
- signal: `gate_fail` · recurrence: 1 feature(s) · scope: `.specs/promocao` · harmful: 0
- features: consumer-promotion
- evidence: .specs/features/consumer-promotion/validation.md:49 (.specs/promocao)
- last seen: 2026-10-26T03:36:25Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
