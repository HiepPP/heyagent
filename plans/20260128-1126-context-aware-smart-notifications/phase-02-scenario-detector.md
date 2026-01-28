# Phase 02: Scenario Detector

Classify hook events into scenarios: errors, permissions, idle, completion.

## Context

- Hook notification types: permission_prompt, idle_prompt, auth_success, elicitation_dialog
- ContextParser from Phase 01
- Stop event (no notification_type) needs separate handling

## Overview

Detect scenario from notification_type and context analysis.

**Priority**: High - Determines which suggestions to show

## Key Insights

From Claude Code docs:

- Notification events have notification_type field
- Stop events have stop_hook_active flag
- Scenario requires combining notification_type + context

## Requirements

### Functional

- Map notification_type to scenario
- Detect errors in transcript (error patterns in tool results)
- Classify Stop event reason (completion vs blocked vs error)
- Handle unknown notification_types

### Non-Functional

- < 10ms classification time
- 100% coverage of known types
- Graceful handling of new types

## Architecture

```
ContextParser output
    ↓
ScenarioDetector.detect(context)
    ↓
{
  scenario: 'permission' | 'error' | 'idle' | 'completion' | 'question',
  confidence: number,
  subtype: string,
  context: object
}
```

## Scenario Classification

| notification_type          | scenario   | subtype          |
| -------------------------- | ---------- | ---------------- |
| permission_prompt          | permission | tool_name        |
| idle_prompt                | idle       | timeout          |
| auth_success               | completion | auth             |
| elicitation_dialog         | question   | mcp_setup        |
| Stop (no type)             | completion | normal (default) |
| Stop + error in transcript | error      | error_type       |

## Related Code Files

### Create

- src/claude/scenario-detector.js - NEW
- src/claude/error-patterns.js - NEW

### Modify

- src/claude/hook.js - Use ScenarioDetector

## Implementation Steps

1. Create error-patterns.js
   - Regex patterns for common errors
   - Error type mapping (SyntaxError, TypeError, etc.)
   - File/line extraction patterns

2. Create scenario-detector.js
   - detectFromNotificationType() - Map known types
   - detectFromTranscript() - Analyze for errors
   - classifyStopEvent() - Determine Stop reason
   - Main detect() method combining all

3. Update hook.js
   - Import ScenarioDetector
   - Call detect() after ContextParser
   - Pass scenario to next phase

## Error Pattern Examples

```javascript
const ERROR_PATTERNS = {
  syntaxError: /SyntaxError:\s*(.+)/i,
  typeError: /TypeError:\s*(.+)/i,
  referenceError: /ReferenceError:\s*(.+)/i,
  fileLocation: /at\s+([^\s:]+):(\d+):\d+/,
  toolFailure: /Error:\s+(.+)/i,
};
```

## Todo List

- [ ] Create src/claude/error-patterns.js
- [ ] Create src/claude/scenario-detector.js
- [ ] Implement detectFromNotificationType()
- [ ] Implement detectFromTranscript()
- [ ] Implement classifyStopEvent()
- [ ] Add unit tests for patterns
- [ ] Update hook.js integration

## Success Criteria

- All notification_types mapped to scenarios
- Errors detected in tool results
- Stop events classified correctly
- Unknown types fallback to 'question'
- < 10ms classification time

## Risk Assessment

**Risk**: False positive error detection
**Mitigation**: Conservative patterns, require clear error markers

**Risk**: New notification_types added by Claude
**Mitigation**: Fallback to 'question', log unknown types

## Security Considerations

- Regex denial of service (limit match length)
- Sanitize extracted error messages

## Next Steps

Phase 03: Suggestion Engine - Generate suggestions for each scenario

Dependencies: ScenarioDetector output format
