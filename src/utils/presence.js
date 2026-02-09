import Logger from '../logger.js';

/**
 * PresenceDetector tracks user activity to suppress notifications
 * when the user is actively typing in the terminal.
 *
 * Uses singleton pattern to share state across all wrappers.
 */
class PresenceDetector {
  constructor() {
    this.logger = new Logger('presence');
    this.lastActivity = Date.now();
    this.thresholdMs = 30000; // 30 seconds of inactivity before notifications resume
    this.enabled = true;
  }

  /**
   * Record that user is currently active (typing in terminal)
   */
  recordActivity() {
    this.lastActivity = Date.now();
    this.logger.debug('User activity recorded');
  }

  /**
   * Check if user is considered "present" (active within threshold)
   */
  isPresent() {
    if (!this.enabled) {
      return false;
    }
    const idleTime = Date.now() - this.lastActivity;
    return idleTime < this.thresholdMs;
  }

  /**
   * Get current idle time in milliseconds
   */
  getIdleTime() {
    return Date.now() - this.lastActivity;
  }

  /**
   * Enable/disable presence detection
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    this.logger.info(`Presence detection ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Set custom threshold for presence detection
   */
  setThreshold(ms) {
    this.thresholdMs = ms;
    this.logger.info(`Presence threshold set to ${ms}ms`);
  }
}

// Singleton instance
let instance = null;

export function getPresenceDetector() {
  if (!instance) {
    instance = new PresenceDetector();
  }
  return instance;
}

export default PresenceDetector;
