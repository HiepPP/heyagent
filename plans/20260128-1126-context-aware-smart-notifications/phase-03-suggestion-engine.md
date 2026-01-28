# Phase 03: Suggestion Engine

Generate rule-based suggestions for each scenario type.

## Context

- ScenarioDetector output from Phase 02
- User selected: rule-based suggestions (not AI-generated)
- Need actionable suggestions for errors, permissions, questions

## Overview

Map scenarios to actionable suggestions using rule-based templates.

**Priority**: High - Core "wow" feature value

## Key Insights

From user clarification:

- Rule-based templates (fast, predictable)
- Cover all scenarios
- Suggestions must be actionable

## Requirements

### Functional

- Generate suggestions for each scenario type
- Include context variables (file path, error type)
- Provide actionable next steps
- Support multiple suggestions per scenario

### Non-Functional

- < 5ms generation time
- Easy to extend (add new rules)
- Localizable (future-proof)

## Architecture

```
ScenarioDetector output
    ↓
SuggestionEngine.generate(scenario, context)
    ↓
{
  primary: string,
  actions: [{ label, command }],
  context: object
}
```

## Suggestion Templates

### Error Scenarios

```javascript
ERROR_SUGGESTIONS = {
  SyntaxError: {
    primary: 'Fix syntax error in {file}:{line}',
    actions: [
      { label: 'View file', hint: 'Open {file}' },
      { label: 'Check syntax', hint: 'Run linter' },
    ],
  },
  TypeError: {
    primary: 'Fix type error: {message}',
    actions: [{ label: 'Check types', hint: 'Review type definitions' }],
  },
  default: {
    primary: 'Error in {file}',
    actions: [{ label: 'View logs', hint: 'Check terminal output' }],
  },
};
```

### Permission Scenarios

```javascript
PERMISSION_SUGGESTIONS = {
  Bash: {
    primary: 'Approve bash command',
    actions: [{ label: 'Approve', hint: 'Command: {command}' }],
  },
  Write: {
    primary: 'Review file write',
    actions: [{ label: 'View diff', hint: 'Check changes to {file}' }],
  },
  default: {
    primary: 'Action requires approval',
    actions: [{ label: 'Check terminal', hint: 'Review pending action' }],
  },
};
```

### Idle/Question Scenarios

```javascript
IDLE_SUGGESTIONS = {
  primary: 'Claude is waiting for input',
  actions: [{ label: 'Respond', hint: 'Provide next instruction' }],
};

COMPLETION_SUGGESTIONS = {
  primary: 'Task completed successfully',
  actions: [
    { label: 'Continue', hint: 'Provide next task' },
    { label: 'Review', hint: 'Check results' },
  ],
};
```

## Related Code Files

### Create

- src/claude/suggestion-engine.js - NEW
- src/claude/suggestion-templates.js - NEW

### Modify

- src/claude/hook.js - Use SuggestionEngine

## Implementation Steps

1. Create suggestion-templates.js
   - Define ERROR_SUGGESTIONS mapping
   - Define PERMISSION_SUGGESTIONS mapping
   - Define IDLE_SUGGESTIONS, COMPLETION_SUGGESTIONS
   - Add template variable substitution

2. Create suggestion-engine.js
   - generate() - Main entry point
   - selectTemplate() - Choose based on scenario
   - substitute() - Replace variables in templates
   - formatActions() - Create action buttons

3. Update hook.js
   - Import SuggestionEngine
   - Call generate() after scenario detection
   - Pass suggestions to notification

## Template Variables

| Variable  | Source                              | Example          |
| --------- | ----------------------------------- | ---------------- |
| {file}    | context.lastToolUse.input.file_path | src/auth.ts      |
| {line}    | extracted from error message        | 42               |
| {error}   | context.lastError.type              | SyntaxError      |
| {message} | context.lastError.message           | Unexpected token |
| {command} | context.lastToolUse.input.command   | npm test         |
| {project} | context.project                     | heyagent         |

## Todo List

- [ ] Create src/claude/suggestion-templates.js
- [ ] Create src/claude/suggestion-engine.js
- [ ] Implement template substitution
- [ ] Add error type mappings
- [ ] Add permission type mappings
- [ ] Update hook.js integration
- [ ] Test all scenario types

## Success Criteria

- All scenarios have suggestions
- Template variables substituted correctly
- Actions are actionable (not generic)
- Missing templates have sensible defaults
- < 5ms generation time

## Risk Assessment

**Risk**: Template variables missing, ugly output
**Mitigation**: Default values for all variables, validation

**Risk**: Suggestions not actually helpful
**Mitigation**: Start with minimal set, user feedback loop

## Security Considerations

- Sanitize all template variables (prevent injection)
- Limit action label length
- No command execution from suggestions (yet)

## Next Steps

Phase 04: Notification Templates - Format notifications with context and suggestions

Dependencies: SuggestionEngine output format
