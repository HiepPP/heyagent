# Phase 06: Testing

Test context-aware notifications across all channels and scenarios.

## Context

- All components implemented (parser, detector, engine, templates, service)
- Need comprehensive testing before release
- Multiple notification channels to validate

## Overview

Test all scenarios across all notification channels with various context combinations.

**Priority**: High - Ensure quality before release

## Key Insights

From codebase:

- No existing test infrastructure visible
- Manual testing required for notification channels
- External API calls for paid channels (need license)

## Requirements

### Functional

- Test all scenario types (error, permission, idle, completion)
- Test all notification channels (desktop, email, Slack, webhook)
- Test edge cases (missing data, malformed input)
- Test backward compatibility

### Non-Functional

- Performance testing (hook execution time)
- Manual testing checklist
- Documentation for user testing

## Test Scenarios

### Scenario Coverage

| Scenario    | Test Case              | Expected                                     |
| ----------- | ---------------------- | -------------------------------------------- |
| SyntaxError | Error in transcript    | Notification with file, line, fix suggestion |
| Permission  | Bash permission prompt | Notification with command details            |
| Idle        | 60s idle timeout       | Notification with waiting message            |
| Completion  | Normal Stop            | Notification with success message            |
| Unknown     | New notification_type  | Graceful fallback to question                |

### Channel Coverage

| Channel | Test Method      | Validation                         |
| ------- | ---------------- | ---------------------------------- |
| Desktop | Manual           | See notification, click works      |
| Email   | Manual (license) | Email received, formatting correct |
| Slack   | Manual (license) | Slack message, markdown renders    |
| Webhook | Manual           | JSON payload received              |

## Test Plan

### Unit Tests (if framework added)

```bash
# Would be in tests/ directory
npm test
```

Tests:

- ContextParser.parse() extracts all fields
- ScenarioDetector.detect() classifies correctly
- SuggestionEngine.generate() returns actions
- NotificationTemplate.format() outputs correct format

### Integration Tests

Manual test script:

```bash
# Setup
cd /Users/hiep/Project/heyagent
npm run pack:install

# Test 1: Normal Stop event
echo "Testing Stop event..."
hey claude
# Wait for Claude to finish
# Check notification received

# Test 2: Permission prompt
echo "Testing permission event..."
# In Claude: Ask to run a bash command
# Check notification received with context

# Test 3: Error in transcript
echo "Testing error event..."
# In Claude: Cause a syntax error
# Check notification with error details

# Test 4: Different channels
hey config
# Select different channels
# Repeat tests above
```

### Performance Tests

```bash
# Measure hook execution time
time echo '{"hook_event_name":"Stop"}' | hey claude-hook

# Should be < 100ms for parsing, detection, suggestions
```

## Related Code Files

### Create

- tests/context-parser.test.js - NEW (if adding jest)
- tests/scenario-detector.test.js - NEW
- tests/suggestion-engine.test.js - NEW
- tests/manual-test-checklist.md - NEW

### Modify

- package.json - Add test scripts (if adding jest)

## Implementation Steps

1. Create manual-test-checklist.md
   - Step-by-step test procedures
   - Expected results for each scenario
   - Channel-specific validation

2. Create performance benchmarks
   - Hook execution time measurement
   - Transcript parsing speed
   - Memory usage

3. (Optional) Add unit test framework
   - Install jest or similar
   - Write unit tests for pure functions
   - Add test script to package.json

4. Execute test plan
   - Run through all scenarios
   - Test each channel
   - Document results

5. Bug fixes
   - Fix any issues found
   - Re-test fixes

## Manual Test Checklist

- [ ] Desktop: Error notification shows file path
- [ ] Desktop: Permission notification shows tool name
- [ ] Desktop: Completion notification clear
- [ ] Email: Markdown formatting renders
- [ ] Slack: Message formatting correct
- [ ] Webhook: JSON payload structure valid
- [ ] Backward compat: Old send(title, message) works
- [ ] Performance: Hook < 100ms
- [ ] Error handling: Missing transcript handled
- [ ] Error handling: Malformed JSON handled

## Todo List

- [ ] Create tests/manual-test-checklist.md
- [ ] Create tests/performance-benchmarks.js
- [ ] (Optional) Add jest to package.json
- [ ] (Optional) Write unit tests
- [ ] Execute manual test plan
- [ ] Document test results
- [ ] Fix any bugs found
- [ ] Re-test after fixes

## Success Criteria

- All scenarios produce correct notifications
- All channels receive formatted messages
- Backward compatibility maintained
- Hook execution < 100ms
- No crashes on edge cases
- Test results documented

## Risk Assessment

**Risk**: Paid channels require license for testing
**Mitigation**: Focus on desktop + webhook, note paid channels untested

**Risk**: Test environment different from production
**Mitigation**: Test on multiple machines if possible

## Security Considerations

- Don't test with real sensitive data
- Use fake API keys in webhook tests
- Verify no data leakage in notifications

## Next Steps

Release preparation:

- Update README with new features
- Add examples to documentation
- Create migration guide for existing users

Dependencies: All tests passing
