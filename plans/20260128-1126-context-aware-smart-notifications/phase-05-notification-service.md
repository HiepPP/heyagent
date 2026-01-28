# Phase 05: Notification Service Extension

Extend NotificationService to handle structured context data.

## Context

- Existing NotificationService in src/notification.js
- Current API: send(title, message)
- New requirement: send(context) with scenario, suggestions, etc.

## Overview

Refactor NotificationService to accept structured context while maintaining backward compatibility.

**Priority**: High - Integration layer for all components

## Key Insights

From codebase analysis:

- NotificationService.handleChannels() routes to specific methods
- Desktop, email, Slack, webhook, WhatsApp, Telegram
- Each channel has specific payload structure
- External API call for paid channels

## Requirements

### Functional

- Accept structured context object
- Maintain backward compatibility with send(title, message)
- Route to appropriate channel formatter
- Pass enriched data to external API

### Non-Functional

- No breaking changes to existing API
- Graceful fallback for missing context fields
- Maintain existing error handling

## Architecture

```
New API:
notification.send(context)
    ↓
NotificationTemplate.format(channel, context)
    ↓
Existing channel handlers
    ↓
User receives notification
```

```
Old API (still works):
notification.send(title, message)
    ↓
Wrap in minimal context
    ↓
Continue as normal
```

## Related Code Files

### Modify

- src/notification.js - Major refactor
- src/claude/hook.js - Update send() call

### No new files

## Implementation Steps

1. Update notification.js
   - Add sendContext() method for new API
   - Modify send() to detect input type (backward compat)
   - Update sendMessageNotification() payload
   - Update sendCustomWebhookNotification() payload

2. Update hook.js
   - Pass enriched context to send()
   - Remove old NOTIFICATION_CONSTANTS usage

3. Add backward compatibility
   - send(title, message) still works
   - Auto-wraps in minimal context
   - Logs deprecation warning

## API Changes

### Before

```javascript
// src/claude/hook.js
await notificationService.send(NOTIFY_TITLE_CLAUDE, NOTIFY_MSG_CLAUDE_DONE);
```

### After

```javascript
// src/claude/hook.js
const context = {
  scenario: 'error',
  project: 'heyagent',
  error: { type: 'SyntaxError', file: 'src/auth.ts', line: 42 },
  suggestions: [{ label: 'Fix import', command: 'code src/auth.ts' }],
};
await notificationService.sendContext(context);
```

### Backward Compatible

```javascript
// Still works, wraps in { title, message }
await notificationService.send('Simple notification', 'Message here');
```

## Payload Structure Updates

### Email/Slack/Telegram/WhatsApp

Before:

```javascript
{
  title: string,
  message: string,
  method: string,
  // ... channel specific fields
}
```

After:

```javascript
{
  title: string,
  message: string,
  richMessage: string,  // NEW
  scenario: string,     // NEW
  metadata: object,     // NEW
  method: string,
  // ... channel specific fields
}
```

### Webhook

Before:

```javascript
// Just title and message
```

After:

```javascript
{
  title: string,
  message: string,
  scenario: string,
  project: string,
  context: {
    error: object,
    toolUse: object,
    suggestions: array
  },
  timestamp: string
}
```

## Todo List

- [ ] Add sendContext() method to NotificationService
- [ ] Update send() to detect input type
- [ ] Update sendMessageNotification() payload
- [ ] Update sendWebhookNotification() payload
- [ ] Update hook.js to use new API
- [ ] Add backward compatibility wrapper
- [ ] Add deprecation warnings
- [ ] Test all channels

## Success Criteria

- New API works with structured context
- Old API still functions (backward compat)
- All channels receive enriched data
- External API handles new payload structure
- No breaking changes for existing users

## Risk Assessment

**Risk**: Breaking existing notifications
**Mitigation**: Extensive backward compatibility testing

**Risk**: External API rejects new payload
**Mitigation**: Server-side changes, graceful degradation

**Risk**: Payload size exceeds limits
**Mitigation**: Truncate suggestions, limit context depth

## Security Considerations

- Sanitize all context fields before sending
- No sensitive data in webhook metadata
- Validate payload size before API call

## Next Steps

Phase 06: Testing - Test across all notification channels

Dependencies: Completed notification service integration
