#!/usr/bin/env node

import { parseHookPayload } from './src/claude/context-parser.js';
import { detectScenario } from './src/claude/scenario-detector.js';
import { generate } from './src/claude/suggestion-engine.js';
import { format as formatNotification } from './src/claude/notification-templates.js';

const TEST_HOOKS = {
  stopWithError: {
    session_id: 'test-123',
    transcript_path: null,
    cwd: '/Users/test/heyagent',
    permission_mode: 'default',
    hook_event_name: 'Stop',
    stop_hook_active: false,
  },
  permissionPrompt: {
    session_id: 'test-456',
    transcript_path: null,
    cwd: '/Users/test/heyagent',
    permission_mode: 'default',
    hook_event_name: 'Notification',
    notification_type: 'permission_prompt',
    message: 'Claude needs your permission to use Bash',
  },
  idlePrompt: {
    session_id: 'test-789',
    transcript_path: null,
    cwd: '/Users/test/myproject',
    permission_mode: 'default',
    hook_event_name: 'Notification',
    notification_type: 'idle_prompt',
    message: 'Claude is waiting for your input',
  },
};

async function testPipeline(name, hookData, channel = 'desktop') {
  console.log(`\n=== Testing: ${name} (${channel}) ===`);

  try {
    const context = await parseHookPayload(hookData);
    console.log('Context:', {
      project: context.project,
      notificationType: context.notification_type,
      hasTranscript: !!context.transcript_path,
    });

    const scenario = detectScenario(context);
    console.log('Scenario:', {
      scenario: scenario.scenario,
      subtype: scenario.subtype,
      confidence: scenario.confidence,
    });

    const suggestion = generate(scenario, context);
    console.log('Suggestion:', {
      primary: suggestion.primary,
      actions: suggestion.actions.slice(0, 2).map(a => ({ label: a.label })),
    });

    const formatted = formatNotification(channel, scenario, context, suggestion);
    console.log('Formatted Notification:');
    console.log(`  Title: "${formatted.title}"`);
    console.log(`  Message: "${formatted.message}"`);

    console.log('Status: PASS');
    return true;
  } catch (error) {
    console.log(`Status: FAIL - ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 Testing Context-Aware Smart Notifications\n');

  const results = [];

  results.push(await testPipeline('Stop Event (without transcript)', TEST_HOOKS.stopWithError, 'desktop'));
  results.push(await testPipeline('Permission Prompt', TEST_HOOKS.permissionPrompt, 'desktop'));
  results.push(await testPipeline('Idle Prompt', TEST_HOOKS.idlePrompt, 'desktop'));
  results.push(await testPipeline('Permission (Webhook)', TEST_HOOKS.permissionPrompt, 'webhook'));

  console.log('\n=== Test Summary ===');
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('All tests passed! ✅');
    process.exit(0);
  } else {
    console.log('Some tests failed! ❌');
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
