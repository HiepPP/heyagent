const ERROR_SUGGESTIONS = {
  SyntaxError: {
    primary: 'Fix syntax error in {file}:{line}',
    actions: [
      { label: 'View file', hint: 'Open {file}' },
      { label: 'Check syntax', hint: 'Review line {line}' },
    ],
  },
  TypeError: {
    primary: 'Type error: {message}',
    actions: [
      { label: 'Check types', hint: 'Review type definitions' },
      { label: 'View file', hint: 'Open {file}' },
    ],
  },
  ReferenceError: {
    primary: 'Undefined reference: {symbol}',
    actions: [
      { label: 'Check imports', hint: 'Verify imports' },
      { label: 'View file', hint: 'Open {file}' },
    ],
  },
  ImportError: {
    primary: 'Missing module: {module}',
    actions: [
      { label: 'Install', hint: 'npm install {module}' },
      { label: 'Check deps', hint: 'Review package.json' },
    ],
  },
  PermissionError: {
    primary: 'Permission denied for {file}',
    actions: [
      { label: 'Check permissions', hint: 'Verify file access' },
      { label: 'View file', hint: 'Open {file}' },
    ],
  },
  FileNotFoundError: {
    primary: 'File not found: {file}',
    actions: [
      { label: 'Create file', hint: 'Create missing file' },
      { label: 'Check path', hint: 'Verify file path' },
    ],
  },
  TestFailure: {
    primary: 'Test failed in {project}',
    actions: [
      { label: 'Run tests', hint: 'npm test' },
      { label: 'View logs', hint: 'Check test output' },
    ],
  },
  default: {
    primary: 'Error in {project}',
    actions: [
      { label: 'Check logs', hint: 'Review terminal output' },
      { label: 'View file', hint: 'Open {file}' },
    ],
  },
};

const PERMISSION_SUGGESTIONS = {
  Bash: {
    primary: 'Bash command requires approval',
    actions: [
      { label: 'Review', hint: 'Command: {command}' },
      { label: 'Approve', hint: 'Allow execution' },
    ],
  },
  Write: {
    primary: 'Writing to {file}',
    actions: [
      { label: 'Check path', hint: 'File: {file}' },
      { label: 'Review', hint: 'Check content' },
    ],
  },
  Edit: {
    primary: 'Editing {file}',
    actions: [
      { label: 'View changes', hint: 'Review modifications' },
      { label: 'Approve', hint: 'Allow edit' },
    ],
  },
  Read: {
    primary: 'Reading {file}',
    actions: [{ label: 'View', hint: 'Open file' }],
  },
  WebFetch: {
    primary: 'Fetching: {url}',
    actions: [
      { label: 'Review', hint: 'Check URL' },
      { label: 'Approve', hint: 'Allow fetch' },
    ],
  },
  WebSearch: {
    primary: 'Searching web',
    actions: [
      { label: 'Review', hint: 'Check query' },
      { label: 'Approve', hint: 'Allow search' },
    ],
  },
  default: {
    primary: 'Action requires approval',
    actions: [
      { label: 'Check terminal', hint: 'Review pending action' },
      { label: 'Approve', hint: 'Allow action' },
    ],
  },
};

const IDLE_SUGGESTIONS = {
  primary: '{project} is waiting for you',
  actions: [
    { label: 'Respond', hint: 'Provide next instruction' },
    { label: 'Continue', hint: 'Resume session' },
  ],
};

const COMPLETION_SUGGESTIONS = {
  primary: '{project} completed',
  actions: [
    { label: 'Continue', hint: 'Provide next task' },
    { label: 'Review', hint: 'Check results' },
  ],
};

const QUESTION_SUGGESTIONS = {
  primary: '{project} needs input',
  actions: [
    { label: 'Respond', hint: 'Answer question' },
    { label: 'Check terminal', hint: 'Review details' },
  ],
};

function getTemplate(scenario, subtype = null) {
  switch (scenario) {
    case 'error':
      return ERROR_SUGGESTIONS[subtype] || ERROR_SUGGESTIONS.default;
    case 'permission':
      return PERMISSION_SUGGESTIONS[subtype] || PERMISSION_SUGGESTIONS.default;
    case 'idle':
      return IDLE_SUGGESTIONS;
    case 'completion':
      return COMPLETION_SUGGESTIONS;
    case 'question':
      return QUESTION_SUGGESTIONS;
    default:
      return QUESTION_SUGGESTIONS;
  }
}

function substituteVariables(template, context) {
  const vars = {
    project: context.project || 'project',
    file: context.file || context.lastError?.file || '',
    line: context.line || context.lastError?.line || '',
    error: context.errorType || context.lastError?.type || '',
    message: context.errorMessage || context.lastError?.message || '',
    symbol: extractSymbol(context.errorMessage || context.lastError?.message || ''),
    module: extractModule(context.errorMessage || context.lastError?.message || ''),
    command: context.lastToolUse?.input?.command || '',
    url: context.lastToolUse?.input?.url || '',
    tool: context.lastToolUse?.name || '',
  };

  let result = template.primary || '';
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  return result;
}

function substituteActionVariables(action, context) {
  const vars = {
    project: context.project || 'project',
    file: context.file || context.lastError?.file || '',
    line: context.line || context.lastError?.line || '',
    command: context.lastToolUse?.input?.command || '',
    module: extractModule(context.errorMessage || context.lastError?.message || ''),
    url: context.lastToolUse?.input?.url || '',
  };

  let hint = action.hint || '';
  for (const [key, value] of Object.entries(vars)) {
    hint = hint.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }

  return {
    label: action.label,
    hint: hint,
  };
}

function extractSymbol(errorMessage) {
  const match = errorMessage.match(/([a-zA-Z_$][\w$]*)\s+is\s+not\s+defined/);
  return match ? match[1] : '';
}

function extractModule(errorMessage) {
  const match = errorMessage.match(/Cannot find module ['"](.+?)['"]/);
  return match ? match[1] : '';
}

export {
  ERROR_SUGGESTIONS,
  PERMISSION_SUGGESTIONS,
  IDLE_SUGGESTIONS,
  COMPLETION_SUGGESTIONS,
  QUESTION_SUGGESTIONS,
  getTemplate,
  substituteVariables,
  substituteActionVariables,
};
