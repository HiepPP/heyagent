# Suggestion Templates Research Report

**Date**: 2026-01-28
**Researcher**: Suggestion Analysis
**Focus**: Actionable suggestions for common scenarios

## Summary

Rule-based suggestion templates mapped to scenarios and error types. Fast, predictable, no AI required.

## Scenario Categories

### 1. Error Scenarios

Triggered by: `is_error: true` in tool results, error patterns in transcript

| Error Type     | Pattern              | Suggestion                        |
| -------------- | -------------------- | --------------------------------- |
| SyntaxError    | `SyntaxError:`       | Check syntax, fix typo            |
| TypeError      | `TypeError:`         | Check types, verify variables     |
| ReferenceError | `ReferenceError:`    | Undefined variable, check imports |
| ImportError    | `Cannot find module` | Install missing dependency        |
| TestFailure    | `FAIL:`              | Fix failing test                  |

### 2. Permission Scenarios

Triggered by: `notification_type: "permission_prompt"`

| Tool     | Suggestion                         |
| -------- | ---------------------------------- |
| Bash     | Review command before approving    |
| Write    | Check file path and content        |
| Edit     | Verify changes                     |
| Read     | Usually safe to approve            |
| WebFetch | Check URL, verify external request |

### 3. Idle Scenarios

Triggered by: `notification_type: "idle_prompt"`

Suggestion: "Claude is waiting for your input"

### 4. Completion Scenarios

Triggered by: Stop event with no errors, `notification_type: "auth_success"`

Suggestion: "Task completed - provide next instruction"

## Action Button Templates

### Error Actions

```javascript
{
  label: "View file",
  hint: "Open {file}:{line}",
  command: "code -g {file}:{line}"  // Future feature
}
```

```javascript
{
  label: "Run tests",
  hint: "Check test status",
  command: "npm test"  // Future feature
}
```

### Permission Actions

```javascript
{
  label: "Approve",
  hint: "Allow {tool}: {command}",
  action: "approve"  // Future feature
}
```

```javascript
{
  label: "Review",
  hint: "Check terminal for details",
  action: "focus"  // Future feature
}
```

## Template Variable Sources

| Variable    | Source                       |
| ----------- | ---------------------------- |
| `{project}` | `basename(cwd)`              |
| `{file}`    | `tool_input.file_path`       |
| `{line}`    | Extracted from error message |
| `{error}`   | `lastError.type`             |
| `{message}` | `lastError.message`          |
| `{tool}`    | `lastToolUse.name`           |
| `{command}` | `lastToolUse.input.command`  |

## Suggestion Library

### Errors

```javascript
const ERROR_SUGGESTIONS = {
  SyntaxError: {
    primary: 'Fix syntax error in {file}:{line}',
    actions: [{ label: 'View file', hint: 'Open {file}' }],
  },
  TypeError: {
    primary: 'Type error: {message}',
    actions: [{ label: 'Check types', hint: 'Review type definitions' }],
  },
  ReferenceError: {
    primary: 'Undefined reference: {symbol}',
    actions: [{ label: 'Check imports', hint: 'Verify imports' }],
  },
  ImportError: {
    primary: 'Missing module: {module}',
    actions: [{ label: 'Install', hint: 'npm install {module}' }],
  },
  TestFailure: {
    primary: 'Test failed in {file}',
    actions: [{ label: 'Run tests', hint: 'npm test' }],
  },
  default: {
    primary: 'Error in {project}',
    actions: [{ label: 'Check logs', hint: 'Review terminal' }],
  },
};
```

### Permissions

```javascript
const PERMISSION_SUGGESTIONS = {
  Bash: {
    primary: 'Bash command requires approval',
    actions: [{ label: 'Review', hint: 'Command: {command}' }],
  },
  Write: {
    primary: 'Writing to {file}',
    actions: [{ label: 'Check path', hint: 'File: {file}' }],
  },
  Edit: {
    primary: 'Editing {file}',
    actions: [{ label: 'Review changes', hint: 'Check modifications' }],
  },
  default: {
    primary: 'Action requires approval',
    actions: [{ label: 'Check terminal', hint: 'Review pending action' }],
  },
};
```

## Future Enhancements

### Interactive Actions

Phase 2 could add clickable actions:

- Quick approve permission
- Jump to file in editor
- Run command from notification
- Copy error message

### Configurable Rules

Users could customize suggestion rules:

```javascript
// ~/.heyagent/suggestions.json
{
  "customRules": {
    "E2E": {
      "pattern": "E2E test failed",
      "suggestion": "Check database connection"
    }
  }
}
```

## Implementation Notes

1. **Keep it simple**: Start with 5-10 common scenarios
2. **Make it extendable**: Easy to add new rules
3. **Default fallback**: Always have a generic suggestion
4. **Template safety**: Validate variables before substitution
5. **Keep it fast**: No AI, pure template substitution

## Sources

- Common Node.js error patterns
- Claude Code tool documentation
- heyagent existing notification patterns
