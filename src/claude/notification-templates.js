// Logger available but not commonly needed

const DESKTOP_MAX_LENGTH = 200;

function format(channel, scenario, context, suggestion) {
  switch (channel) {
    case 'desktop':
      return formatDesktop(scenario, context, suggestion);
    case 'email':
    case 'slack':
    case 'telegram':
      return formatMarkdown(scenario, context, suggestion);
    case 'webhook':
      return formatWebhook(scenario, context, suggestion);
    default:
      return formatDesktop(scenario, context, suggestion);
  }
}

function formatDesktop(scenario, context, suggestion) {
  let title = context.project || 'Project';
  let message = '';

  switch (scenario.scenario) {
    case 'error': {
      title = `${context.project} - Error`;
      const file = context.file || context.lastError?.file || '';
      const line = context.line || context.lastError?.line || '';
      const loc = file ? (line ? `${file}:${line}` : file) : '';
      message = suggestion?.primary || `Error${loc ? ' in ' + loc : ''}`;
      break;
    }

    case 'permission': {
      title = `${context.project} - Approval needed`;
      const tool = context.lastToolUse?.name || 'Action';
      message = suggestion?.primary || `${tool} requires approval`;
      break;
    }

    case 'idle': {
      title = `${context.project} is waiting`;
      message = suggestion?.primary || 'Claude needs your input';
      break;
    }

    case 'completion': {
      title = `${context.project} completed`;
      message = suggestion?.primary || 'Task finished';
      break;
    }

    default: {
      title = context.project;
      message = suggestion?.primary || 'Waiting for input';
      break;
    }
  }

  message = truncate(message, DESKTOP_MAX_LENGTH);

  return { title, message };
}

function formatMarkdown(scenario, context, suggestion) {
  const project = context.project || 'Project';
  let emoji = '';
  let details = '';

  switch (scenario.scenario) {
    case 'error': {
      emoji = '';
      const errFile = context.file || context.lastError?.file;
      const errLine = context.line || context.lastError?.line;
      const errType = context.errorType || context.lastError?.type;
      const errMsg = context.errorMessage || context.lastError?.message;

      details = `\n\n**File:** ${errFile || 'unknown'}${errLine ? `:${errLine}` : ''}`;
      if (errType) details += `\n**Error:** ${errType}`;
      if (errMsg) details += `\n**Message:** ${errMsg}`;
      break;
    }

    case 'permission': {
      emoji = '';
      const tool = context.lastToolUse?.name || 'Action';
      const command = context.lastToolUse?.input?.command || '';
      details = `\n\n**Tool:** ${tool}`;
      if (command) details += `\n**Command:** \`${command}\``;
      break;
    }

    case 'idle': {
      emoji = '';
      details = '\n\nClaude is waiting for your input to continue.';
      break;
    }

    case 'completion': {
      emoji = '';
      details = '\n\nTask completed successfully. Ready for next task.';
      break;
    }

    default: {
      emoji = '';
      details = '';
      break;
    }
  }

  const primary = suggestion?.primary || `${project} is waiting for you`;
  const actionHints = (suggestion?.actions || [])
    .map(a => a.hint)
    .filter(h => h)
    .slice(0, 2);

  let actions = '';
  if (actionHints.length > 0) {
    actions = '\n\n**Actions:**\n' + actionHints.map(h => `- ${h}`).join('\n');
  }

  const message = `${emoji} **${primary}**${details}${actions}`;

  return {
    title: `${emoji} ${project}`,
    message,
    richMessage: message,
  };
}

function formatWebhook(scenario, context, suggestion) {
  return {
    title: `${context.project} - ${scenario.scenario}`,
    message: suggestion?.primary || 'Waiting for input',
    scenario: scenario.scenario,
    subtype: scenario.subtype,
    project: context.project,
    timestamp: new Date().toISOString(),
    context: {
      cwd: context.cwd,
      sessionId: context.session_id,
      hookEvent: context.hook_event_name,
      notificationType: context.notification_type,
    },
    error: context.lastError
      ? {
          type: context.lastError.type,
          message: context.lastError.message,
          file: context.lastError.file,
          line: context.lastError.line,
        }
      : null,
    toolUse: context.lastToolUse
      ? {
          name: context.lastToolUse.name,
          input: context.lastToolUse.input,
        }
      : null,
    suggestions: (suggestion?.actions || []).map(a => ({
      label: a.label,
      hint: a.hint,
    })),
  };
}

function truncate(str, maxLength) {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

export { format, formatDesktop, formatMarkdown, formatWebhook };
