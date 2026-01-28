import process from 'process';
import Logger from '../logger.js';
import { NOTIFY_TITLE_CLAUDE, NOTIFY_MSG_CLAUDE_DONE } from '../constants.js';

import Config from '../config.js';
import NotificationService from '../notification.js';
import { parseHookPayload } from './context-parser.js';
import { detectScenario } from './scenario-detector.js';
import { generate } from './suggestion-engine.js';
import { format as formatNotification } from './notification-templates.js';

class HookHandler {
  constructor() {
    this.logger = new Logger('hook');
  }

  getNotificationService() {
    const config = new Config();
    return new NotificationService(config);
  }

  async readInput() {
    let input = '';
    process.stdin.setEncoding('utf8');
    for await (const chunk of process.stdin) {
      input += chunk;
    }
    return input;
  }

  async handleHook() {
    const input = await this.readInput();
    this.logger.info(`Claude hook input received`);

    let hookData;
    try {
      hookData = JSON.parse(input.trim());
    } catch (error) {
      this.logger.error(`Failed to parse hook input: ${error.message}`);
      return;
    }

    const eventType = hookData.hook_event_name;

    if (eventType !== 'Stop' && eventType !== 'Notification') {
      this.logger.info(`Unknown event type: ${eventType}`);
      return;
    }

    const notificationService = this.getNotificationService();
    const method = notificationService.config.notificationMethod || 'desktop';

    try {
      const context = await parseHookPayload(hookData);
      const scenario = detectScenario(context);
      const suggestion = generate(scenario, context);

      const formatted = formatNotification(method, scenario, context, suggestion);

      if (method === 'webhook') {
        await notificationService.sendWebhookContext(formatted);
      } else if (method === 'email' || method === 'slack' || method === 'telegram') {
        await notificationService.sendRich(formatted.title, formatted.message);
      } else {
        await notificationService.send(formatted.title, formatted.message);
      }
    } catch (error) {
      this.logger.error(`Smart notification failed: ${error.message}`);
      this.logger.info(`Falling back to basic notification`);

      if (eventType === 'Stop') {
        await notificationService.send(NOTIFY_TITLE_CLAUDE, NOTIFY_MSG_CLAUDE_DONE);
      } else {
        await notificationService.send(NOTIFY_TITLE_CLAUDE, hookData.message || 'Claude needs your attention');
      }
    }
  }
}

export default HookHandler;
