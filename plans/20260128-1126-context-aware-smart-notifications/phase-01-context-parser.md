# Phase 01: Context Parser

Extract rich context from Claude Code hook payloads and transcripts.

## Context

- Hook payload docs: [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- Current hook handler: src/claude/hook.js
- Research report: reports/context-parser-research.md

## Overview

Parse hook payloads to extract available fields, read transcript files for additional context.

**Priority**: High - Foundation for all other phases

## Key Insights

From research:

- Hook payload provides: session_id, transcript_path, cwd, notification_type, message
- Transcript is JSONL format with full conversation history
- Last few entries contain most relevant context (recent tool calls, errors)

## Requirements

### Functional

- Parse hook JSON payload (already done, enhance)
- Extract notification_type, transcript_path, cwd, message
- Read transcript file (last 5-10 entries)
- Parse last tool use/result for error details, file paths

### Non-Functional

- Synchronous parsing (hooks have 60s timeout)
- Max 100ms parse time
- Handle missing/invalid transcript gracefully
- Cache transcript reads per session

## Architecture

```
HookPayload
    ↓
ContextParser.parse(payload)
    ↓
{
  notificationType: string,
  transcriptPath: string,
  cwd: string,
  message: string,
  lastToolUse: { name, input, result },
  lastError: { type, message, file, line },
  project: string
}
```

## Related Code Files

### Modify

- src/claude/hook.js - Use ContextParser
- src/constants.js - Add context-related constants

### Create

- src/claude/context-parser.js - NEW
- src/claude/transcript-reader.js - NEW

## Implementation Steps

1. Create transcript-reader.js
   - Read last N lines from JSONL file
   - Parse JSON entries
   - Extract tool use blocks

2. Create context-parser.js
   - parseHookPayload() - Extract all fields
   - enrichFromTranscript() - Read transcript, extract context
   - detectProject() - Use cwd for project name

3. Update hook.js
   - Import ContextParser
   - Use instead of direct JSON.parse
   - Pass enriched context to next phase

4. Add constants
   - MAX_TRANSCRIPT_LINES = 10
   - TRANSCRIPT_CACHE_TTL = 60000

## Todo List

- [ ] Create src/claude/transcript-reader.js
- [ ] Create src/claude/context-parser.js
- [ ] Update src/claude/hook.js to use ContextParser
- [ ] Add constants to src/constants.js
- [ ] Add error handling for missing transcripts
- [ ] Add logging for debugging

## Success Criteria

- Hook payload parsed completely
- Transcript last 10 entries read
- Last tool use extracted (name, input, result)
- Last error extracted (type, message, file, line)
- Graceful fallback when transcript missing

## Risk Assessment

**Risk**: Transcript file locked or very large
**Mitigation**: Read with timeout, limit lines, use stream

**Risk**: JSON parse errors in transcript
**Mitigation**: Try/catch per line, skip malformed entries

## Security Considerations

- Validate transcript_path (prevent directory traversal)
- Sanitize extracted strings (prevent injection)
- Never log transcript content

## Next Steps

Phase 02: Scenario Detector - Use parsed context to detect scenarios

Dependencies: ContextParser output format
