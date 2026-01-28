import Logger from '../logger.js';
import { detectErrorType, extractFileLocation } from './error-patterns.js';

const logger = new Logger('scenario-detector');

const NOTIFICATION_TYPE_MAP = {
  permission_prompt: 'permission',
  idle_prompt: 'idle',
  auth_success: 'completion',
  elicitation_dialog: 'question',
};

function detectScenario(context) {
  if (!context) {
    return {
      scenario: 'unknown',
      confidence: 0,
      subtype: null,
      context: {},
    };
  }

  let result = {
    scenario: 'unknown',
    confidence: 0.5,
    subtype: null,
    context: {},
  };

  if (context.notification_type) {
    result = detectFromNotificationType(context);
  } else if (context.hook_event_name === 'Stop') {
    result = classifyStopEvent(context);
  }

  if (context.lastError) {
    return enhanceWithError(result, context.lastError);
  }

  logger.info(`Detected scenario: ${result.scenario}, subtype: ${result.subtype}`);

  return result;
}

function detectFromNotificationType(context) {
  const notificationType = context.notification_type;
  const baseScenario = NOTIFICATION_TYPE_MAP[notificationType] || 'question';

  let subtype = null;
  if (baseScenario === 'permission' && context.lastToolUse) {
    subtype = context.lastToolUse.name;
  }

  return {
    scenario: baseScenario,
    confidence: 1.0,
    subtype: subtype,
    context: {
      notification_type: notificationType,
      message: context.message,
    },
  };
}

function classifyStopEvent(context) {
  if (context.lastError) {
    const errorInfo = detectErrorType(context.lastError.rawContent || '');
    const location = extractFileLocation(context.lastError.rawContent || '');

    return {
      scenario: 'error',
      confidence: 0.9,
      subtype: errorInfo.type,
      context: {
        errorType: errorInfo.type,
        errorMessage: errorInfo.message,
        file: location.file || context.lastError.file,
        line: location.line || context.lastError.line,
      },
    };
  }

  if (context.stop_hook_active) {
    return {
      scenario: 'working',
      confidence: 0.8,
      subtype: 'continued',
      context: {
        message: 'Claude is continuing work',
      },
    };
  }

  return {
    scenario: 'completion',
    confidence: 0.7,
    subtype: 'normal',
    context: {
      message: 'Task completed',
    },
  };
}

function enhanceWithError(result, lastError) {
  if (result.scenario === 'error') {
    return result;
  }

  if (lastError && lastError.type && lastError.type !== 'Error') {
    return {
      ...result,
      scenario: 'error',
      confidence: Math.max(result.confidence, 0.8),
      subtype: lastError.type,
      context: {
        ...result.context,
        errorType: lastError.type,
        errorMessage: lastError.message,
        file: lastError.file,
        line: lastError.line,
      },
    };
  }

  return result;
}

function isPermissionPrompt(context) {
  return context.notification_type === 'permission_prompt';
}

function isIdlePrompt(context) {
  return context.notification_type === 'idle_prompt';
}

function isError(context) {
  if (context.notification_type) return false;
  return !!context.lastError;
}

function isCompletion(context) {
  if (context.notification_type === 'auth_success') return true;
  if (context.hook_event_name === 'Stop' && !context.lastError) return true;
  return false;
}

export { detectScenario, isPermissionPrompt, isIdlePrompt, isError, isCompletion, NOTIFICATION_TYPE_MAP };
