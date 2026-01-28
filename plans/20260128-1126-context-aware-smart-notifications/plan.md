# Context-Aware Smart Notifications Implementation Plan

Transform heyagent from simple "agent stopped" alerts to actionable intelligence.

## Overview

Current: "heyagent is waiting for you"
Target: "heyagent stopped - SyntaxError in src/auth.ts:42 - Fix import statement"

## Phases

| Phase                                                                   | Status  | Description                                              |
| ----------------------------------------------------------------------- | ------- | -------------------------------------------------------- |
| [phase-01-context-parser](./phase-01-context-parser.md)                 | pending | Parse hook payloads, extract context from transcripts    |
| [phase-02-scenario-detector](./phase-02-scenario-detector.md)           | pending | Detect scenarios (errors, permissions, idle, completion) |
| [phase-03-suggestion-engine](./phase-03-suggestion-engine.md)           | pending | Rule-based suggestions for each scenario                 |
| [phase-04-notification-templates](./phase-04-notification-templates.md) | pending | Rich notification templates using context                |
| [phase-05-notification-service](./phase-05-notification-service.md)     | pending | Extend NotificationService for structured data           |
| [phase-06-testing](./phase-06-testing.md)                               | pending | Test across notification channels                        |

## Key Dependencies

- Claude Code hook payload structure (already available)
- transcript_path for context extraction
- notification_type field for scenario detection
- Existing NotificationService architecture

## Success Criteria

- All scenarios (permission, idle, auth, completion) get context
- Error notifications include file path and suggestion
- Works across all channels (desktop, email, Slack, webhook)
- Backward compatible with existing behavior
- No performance impact on hook execution

## Risk Assessment

| Risk                             | Mitigation                               |
| -------------------------------- | ---------------------------------------- |
| Transcript parsing is slow       | Cache results, limit read size           |
| Suggestion rules too generic     | Start narrow, expand over time           |
| Breaking existing notifications  | Maintain fallback to old behavior        |
| Privacy concerns with transcript | Never send transcript content externally |

## Unresolved Questions

- Should we parse transcript synchronously or asynchronously?
- Max transcript size to parse (performance vs context)?
- Handle multiple notification_types in single event?
