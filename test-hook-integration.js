#!/usr/bin/env node

import HookHandler from './src/claude/hook.js';

const TEST_CASES = [
  {
    name: 'Stop Event',
    input: JSON.stringify({
      hook_event_name: 'Stop',
      session_id: 'test-123',
      cwd: '/Users/test/heyagent',
      permission_mode: 'default',
    }),
  },
  {
    name: 'Permission Prompt',
    input: JSON.stringify({
      hook_event_name: 'Notification',
      notification_type: 'permission_prompt',
      message: 'Claude needs your permission to use Bash',
      session_id: 'test-456',
      cwd: '/Users/test/heyagent',
      permission_mode: 'default',
    }),
  },
  {
    name: 'Idle Prompt',
    input: JSON.stringify({
      hook_event_name: 'Notification',
      notification_type: 'idle_prompt',
      message: 'Claude is waiting for your input',
      session_id: 'test-789',
      cwd: '/Users/test/myproject',
      permission_mode: 'default',
    }),
  },
];

async function testHookHandler() {
  console.log('🧪 Testing HookHandler Integration\n');

  const handler = new HookHandler();

  for (const testCase of TEST_CASES) {
    console.log(`\n=== Testing: ${testCase.name} ===`);
    console.log(`Input: ${testCase.input.substring(0, 100)}...`);

    try {
      const startTime = Date.now();

      await handler.handleHook();

      const elapsed = Date.now() - startTime;
      console.log(`Status: Completed in ${elapsed}ms`);
      console.log('Status: PASS');
    } catch (error) {
      console.log(`Status: FAIL - ${error.message}`);
      console.log(error.stack);
    }
  }

  console.log('\n=== Integration Test Complete ===');
  console.log('Notifications should have appeared on your desktop.');
}

testHookHandler().catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});
