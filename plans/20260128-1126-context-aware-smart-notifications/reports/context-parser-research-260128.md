# Context Parser Research Report

**Date**: 2026-01-28
**Researcher**: Context Analysis
**Focus**: Claude Code hook payload structure and transcript format

## Summary

Claude Code hooks provide rich context data that can be leveraged for smart notifications. The hook payload includes session metadata and event-specific fields. The transcript file contains full conversation history in JSONL format.

## Hook Payload Structure

### Common Fields (All Events)

```javascript
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../abc123.jsonl",
  "cwd": "/Users/.../project",
  "permission_mode": "default",
  "hook_event_name": "Stop" | "Notification" | ...
}
```

### Stop Event Payload

```javascript
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../abc123.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "Stop",
  "stop_hook_active": true
}
```

### Notification Event Payload

```javascript
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../abc123.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "Notification",
  "message": "Claude needs your permission to use Bash",
  "notification_type": "permission_prompt"
}
```

## Notification Types

From [Claude Code Docs](https://code.claude.com/docs/en/hooks):

| Type                 | Scenario   | Description                   |
| -------------------- | ---------- | ----------------------------- |
| `permission_prompt`  | Permission | Tool permission request       |
| `idle_prompt`        | Idle       | Waiting for user input (60s+) |
| `auth_success`       | Completion | Authentication successful     |
| `elicitation_dialog` | Question   | MCP tool configuration        |

## Transcript Format

JSONL (JSON Lines) format - one JSON object per line.

### Example Entry

```javascript
{
  "type": "tool_use",
  "tool_use_id": "toolu_abc123",
  "name": "Bash",
  "input": {
    "command": "npm test",
    "description": "Run tests"
  }
}
```

### Tool Result Entry

```javascript
{
  "type": "tool_result",
  "tool_use_id": "toolu_abc123",
  "content": [
    {
      "type": "text",
      "text": "PASS: All tests passed"
    }
  ],
  "is_error": false
}
```

### Error Entry

```javascript
{
  "type": "tool_result",
  "tool_use_id": "toolu_abc123",
  "content": [
    {
      "type": "text",
      "text": "SyntaxError: Unexpected token in src/auth.ts:42"
    }
  ],
  "is_error": true
}
```

## Key Findings

### Available Context

1. **From Hook Payload**:
   - `cwd` - Current working directory (project location)
   - `transcript_path` - Full path to conversation history
   - `notification_type` - Direct scenario indicator
   - `message` - Human-readable description
   - `session_id` - Unique session identifier

2. **From Transcript** (last 5-10 entries):
   - Last tool used (name, input, result)
   - Error messages with file/line references
   - Recent conversation context
   - Tool success/failure status

### Error Patterns

Common error formats in tool results:

- `SyntaxError: {message} at {file}:{line}`
- `Error: {message}`
- `{tool} failed: {reason}`

### Performance Considerations

- Hook execution timeout: 60 seconds
- Transcript files can be large (full session)
- Reading last 10 entries should be < 100ms
- Caching recommended per session

## Implementation Recommendations

1. **Parse Strategy**:
   - Read last 10 lines only (most recent context)
   - Stream file (don't load entire transcript)
   - Cache parsed context per session_id

2. **Error Extraction**:
   - Use regex patterns on tool_result text
   - Extract file path and line number when available
   - Check `is_error` flag first

3. **Context Fields**:
   - Extract project name from `cwd` (basename)
   - Get last tool use from transcript
   - Get error details from last failed tool result

## Sources

- [Hooks reference - Claude Code Docs](https://code.claude.com/docs/en/hooks)
- Current heyagent implementation: src/claude/hook.js
- Example settings: ~/.claude/settings.json
