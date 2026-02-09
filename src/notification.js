import notifier from 'node-notifier';
import Logger from './logger.js';
import { isPaidNotificationMethod } from './license.js';
import { applyProjectTemplate } from './utils/project.js';
import { getPresenceDetector } from './utils/presence.js';

class NotificationService {
  constructor(config) {
    this.config = config;
    this.logger = new Logger('notification');
  }

  async send(title, message) {
    if (!title) throw new Error('Notification title is required');
    if (!message) throw new Error('Notification message is required');

    // Apply project template substitution to both title and message
    const processedTitle = applyProjectTemplate(title);
    const processedMessage = applyProjectTemplate(message);

    if (!this.config.notificationsEnabled) {
      return;
    }

    // Check if user is present (actively typing) - suppress notification
    if (this.config.presenceDetectionEnabled) {
      const presence = getPresenceDetector();
      if (presence.isPresent()) {
        this.logger.info(`User is present (idle ${presence.getIdleTime()}ms), suppressing notification`);
        return;
      }
    }

    const method = this.config.notificationMethod || 'desktop';

    if (isPaidNotificationMethod(method) && !this.config.licenseKey) {
      throw new Error('Pro notifications require a license. Run "hey license" to set up.');
    }

    if (!this.config.validateConfig(method)) {
      throw new Error('Notification method is not configured. Run "hey config" to set up.');
    }

    if (method === 'email' || method === 'telegram' || method === 'whatsapp' || method === 'slack') {
      this.sendMessageNotification(processedTitle, processedMessage);
    } else if (method === 'webhook') {
      this.sendCustomWebhookNotification(processedTitle, processedMessage);
    } else {
      this.sendDesktopNotification(processedTitle, processedMessage);
    }
  }

  async sendMessageNotification(title, message) {
    const notificationMethod = this.config.data.notificationMethod;
    const payload = {
      title: title,
      message: message,
      method: notificationMethod,
      email: this.config.data.email,
      phoneNumber: this.config.data.phoneNumber,
      chatId: this.config.data.telegramChatId,
      slackWebhookUrl: this.config.data.slackWebhookUrl,
      slackUsername: this.config.data.slackUsername,
    };

    const headers = { 'Content-Type': 'application/json' };
    if (isPaidNotificationMethod(notificationMethod) && this.config.licenseKey) {
      headers.Authorization = `License ${this.config.licenseKey}`;
    }

    const response = await fetch('https://www.heyagent.dev/api/notification', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (response.status === 403 || response.status === 401) {
      throw new Error('Your license is invalid or revoked. Run "hey license" to set up.');
    }

    if (!response.ok) {
      throw new Error(`${notificationMethod} notification failed: ${response.status}`);
    }

    this.logger.info(`${notificationMethod} notification sent`);
  }

  async sendCustomWebhookNotification(title, message, richContext = null) {
    const webhookUrl = this.config.data.webhookUrl;
    if (!webhookUrl) {
      throw new Error('Webhook URL not configured');
    }

    const payload = richContext || {
      title: title,
      message: message,
      timestamp: new Date().toISOString(),
      source: 'heyagent',
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HeyAgent/1.0.0',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook notification failed: ${response.status} ${response.statusText}`);
    }

    this.logger.info(`Webhook notification sent to ${webhookUrl}`);
  }

  sendDesktopNotification(title, message) {
    const isMacOS = process.platform === 'darwin';
    const options = {
      title: title,
      message: message,
      sound: true,
      wait: false,
      timeout: 5,
      appId: 'HeyAgent',
      sender: isMacOS ? 'com.apple.Terminal' : undefined,
    };

    notifier.notify(options, (error, response) => {
      if (error) {
        this.logger.error(`Desktop notification error: ${error.message}`);
      } else {
        this.logger.info(`Desktop notification response: ${response}`);
      }
    });
  }

  async sendRich(title, message) {
    await this.send(title, message);
  }

  async sendWebhookContext(context) {
    if (!this.config.notificationsEnabled) {
      return;
    }

    const method = this.config.notificationMethod || 'desktop';

    if (method === 'webhook') {
      await this.sendCustomWebhookNotification(context.title, context.message, context);
    } else {
      await this.send(context.title, context.message);
    }
  }
}

export default NotificationService;
