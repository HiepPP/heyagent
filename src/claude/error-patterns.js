const ERROR_PATTERNS = {
  syntaxError: {
    regex: /SyntaxError:\s*(.+)/i,
    type: 'SyntaxError',
  },
  typeError: {
    regex: /TypeError:\s*(.+)/i,
    type: 'TypeError',
  },
  referenceError: {
    regex: /ReferenceError:\s*([^\s]+)\s+is\s+not\s+defined/i,
    type: 'ReferenceError',
  },
  importError: {
    regex: /Cannot find module ['"](.+)['"]|Cannot resolve module ['"](.+)['"]/i,
    type: 'ImportError',
  },
  permissionError: {
    regex: /EACCES|EPERM|Permission denied/i,
    type: 'PermissionError',
  },
  fileNotFound: {
    regex: /ENOENT.*?['"](.+?)['"]|no such file or directory.*?['"](.+?)['"]/i,
    type: 'FileNotFoundError',
  },
  testFailure: {
    regex: /FAIL:\s*|Test failed|failing tests/i,
    type: 'TestFailure',
  },

  linterError: {
    regex: /eslint.*error|linting error/i,
    type: 'LinterError',
  },

  networkError: {
    regex: /ECONNREFUSED|ETIMEDOUT|Network error/i,
    type: 'NetworkError',
  },
};

const FILE_LOCATION_PATTERNS = [
  /at\s+([^\s:]+):(\d+):\d+/, // at file.js:42:10
  /([/\w\-+.]+[.](js|ts|jsx|tsx|py|go|rs)):(\d+)/, // file.ts:42
  /in\s+([^\s:]+)\s+line\s+(\d+)/i, // in file.js line 42
];

function detectErrorType(content) {
  if (!content || typeof content !== 'string') {
    return { type: 'Error', message: 'Unknown error' };
  }

  for (const [key, pattern] of Object.entries(ERROR_PATTERNS)) {
    const match = content.match(pattern.regex);
    if (match) {
      let message = match[1] || match[0];
      if (key === 'importError' && !match[1]) {
        message = match[2];
      }
      return {
        type: pattern.type,
        message: message.trim(),
        rawMatch: match[0],
      };
    }
  }

  const lines = content.split('\n');
  const firstLine = lines[0]?.trim() || '';

  return {
    type: 'Error',
    message: firstLine.substring(0, 200),
  };
}

function extractFileLocation(content) {
  if (!content || typeof content !== 'string') {
    return { file: null, line: null };
  }

  for (const pattern of FILE_LOCATION_PATTERNS) {
    const match = content.match(pattern);
    if (match) {
      const file = match[1];
      const line = match[match.length - 1];
      return {
        file: file,
        line: line ? parseInt(line, 10) : null,
      };
    }
  }

  return { file: null, line: null };
}

function matchesErrorPattern(content, errorType) {
  const pattern = ERROR_PATTERNS[errorType];
  if (!pattern) return false;

  return pattern.regex.test(content);
}

function getAllErrorTypes() {
  return Object.keys(ERROR_PATTERNS);
}

export { ERROR_PATTERNS, detectErrorType, extractFileLocation, matchesErrorPattern, getAllErrorTypes };
