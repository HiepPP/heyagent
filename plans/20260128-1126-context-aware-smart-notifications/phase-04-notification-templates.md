# Phase 04: Notification Templates

Format rich notifications using context data and suggestions.

## Context

- ContextParser, ScenarioDetector, SuggestionEngine from previous phases
- Existing NotificationService in src/notification.js
- Multiple notification channels: desktop, email, Slack, webhook

## Overview

Create notification templates that incorporate context and suggestions.

**Priority**: High - User-facing output formatting

## Key Insights

From research:

- Different channels have different formatting capabilities
- Desktop notifications have size limits
- Email/Slack can use markdown
- Webhooks support full JSON

## Requirements

### Functional

- Format notifications for each channel type
- Include error details, file paths, suggestions
- Apply project template substitution (existing feature)
- Support rich formatting where available

### Non-Functional

- Channel-specific formatting
- Graceful degradation for limited channels
- Maintain existing {project} template feature

## Architecture

```
Context + Scenario + Suggestions
    ↓
NotificationTemplate.format(channel)
    ↓
{
  title: string,
  message: string,
  richMessage: string (markdown),
  metadata: object (webhook)
}
```

## Template Examples

### Desktop Notification (limited)

```
Title: heyagent - Error in src/auth.ts
Message: SyntaxError at line 42. Fix import statement.
```

### Email/Slack (markdown)

```markdown
**heyagent stopped - Error detected**

**Project:** heyagent
**File:** src/auth.ts:42
**Error:** SyntaxError

**Suggestion:** Fix import statement

[View File](file://src/auth.ts)
```

### Webhook (JSON)

```json
{
  "title": "heyagent - Error in src/auth.ts",
  "scenario": "error",
  "project": "heyagent",
  "error": {
    "type": "SyntaxError",
    "file": "src/auth.ts",
    "line": 42
  },
  "suggestions": [
    {
      "label": "Fix import",
      "command": "code -g src/auth.ts:42"
    }
  ]
}
```

## Related Code Files

### Create

- src/claude/notification-templates.js - NEW

### Modify

- src/notification.js - Use NotificationTemplates
- src/constants.js - Add template constants

## Implementation Steps

1. Create notification-templates.js
   - formatDesktop() - Simple, short format
   - formatMarkdown() - Rich format for email/Slack
   - formatWebhook() - Full JSON structure
   - Main format() method routing by channel

2. Update notification.js
   - Import NotificationTemplates
   - Replace send(title, message) with send(context)
   - Route to appropriate formatter
   - Pass formatted content to channels

3. Update constants.js
   - Add template strings for each scenario
   - Add formatting constants (max lengths, etc.)

## Template Strings

```javascript
const TEMPLATES = {
  error: {
    title: '{project} - Error in {file}',
    message: '{errorType}: {message} at {file}:{line}',
    suggestion: 'Suggestion: {suggestion}',
  },
  permission: {
    title: '{project} - Permission needed',
    message: 'Approve {tool} use',
    suggestion: 'Action: {action}',
  },
  idle: {
    title: '{project} is waiting',
    message: 'Claude needs your input',
    suggestion: 'Respond to continue',
  },
  completion: {
    title: '{project} completed',
    message: 'Task finished successfully',
    suggestion: 'Ready for next task',
  },
};
```

## Todo List

- [ ] Create src/claude/notification-templates.js
- [ ] Implement formatDesktop()
- [ ] Implement formatMarkdown()
- [ ] Implement formatWebhook()
- [ ] Update notification.js signature
- [ ] Update constants.js with templates
- [ ] Test each channel format

## Success Criteria

- All channels format correctly
- Desktop notifications fit size limits
- Email/Slack use markdown formatting
- Webhooks have full structured data
- Existing {project} substitution still works

## Risk Assessment

**Risk**: Breaking existing notification format
**Mitigation**: Maintain backward compatibility, gradual rollout

**Risk**: Desktop notification too long/truncated
**Mitigation**: Enforce character limits, truncate gracefully

## Security Considerations

- Sanitize all user content in templates
- Escape markdown in email/Slack
- Validate webhook JSON structure

## Next Steps

Phase 05: Notification Service - Extend service to handle structured context

Dependencies: NotificationTemplate output format
