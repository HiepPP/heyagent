import fs from 'fs';
import Logger from '../logger.js';

const logger = new Logger('transcript-reader');

const MAX_TRANSCRIPT_LINES = 10;

async function readLastEntries(transcriptPath, maxLines = MAX_TRANSCRIPT_LINES) {
  if (!transcriptPath) {
    return [];
  }

  try {
    const content = await fs.promises.readFile(transcriptPath, 'utf-8');
    const lines = content.trim().split('\n');
    const lastLines = lines.slice(-maxLines);

    const entries = [];
    for (const line of lastLines) {
      if (!line.trim()) continue;
      try {
        entries.push(JSON.parse(line));
      } catch (e) {
        logger.warn(`Failed to parse transcript line: ${e.message}`);
      }
    }

    logger.info(`Read ${entries.length} entries from transcript`);
    return entries;
  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.warn(`Transcript file not found: ${transcriptPath}`);
    } else {
      logger.error(`Error reading transcript: ${error.message}`);
    }
    return [];
  }
}

function findLastToolUse(entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    if (entry.type === 'tool_use') {
      return {
        name: entry.name,
        input: entry.input || {},
        toolUseId: entry.tool_use_id,
        timestamp: entry.timestamp,
      };
    }
  }
  return null;
}

function findLastError(entries) {
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    if (entry.type === 'tool_result' && entry.is_error) {
      const content = extractTextFromContent(entry.content || []);
      return {
        type: classifyErrorType(content),
        message: extractErrorMessage(content),
        file: extractFilePath(content),
        line: extractLineNumber(content),
        rawContent: content,
      };
    }
  }
  return null;
}

function extractTextFromContent(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('\n');
  }
  return '';
}

function classifyErrorType(content) {
  if (/SyntaxError/i.test(content)) return 'SyntaxError';
  if (/TypeError/i.test(content)) return 'TypeError';
  if (/ReferenceError/i.test(content)) return 'ReferenceError';
  if (/Cannot find module/i.test(content)) return 'ImportError';
  if (/EACCES|EPERM/i.test(content)) return 'PermissionError';
  if (/ENOENT/i.test(content)) return 'FileNotFoundError';
  return 'Error';
}

function extractErrorMessage(content) {
  const match = content.match(/^Error:\s*(.+)$/m) || content.match(/^(SyntaxError|TypeError|ReferenceError):\s*(.+)$/m);
  if (match) {
    return match[2].trim();
  }
  const lines = content.split('\n');
  return lines[0]?.substring(0, 200) || content.substring(0, 200);
}

function extractFilePath(content) {
  const match = content.match(/at\s+([^\s:]+):(\d+):\d+/) || content.match(/([/\w\-+.]+[.](js|ts|py|go|rs)):?(\d+)?/);
  if (match) {
    return match[1];
  }
  return null;
}

function extractLineNumber(content) {
  const match = content.match(/at\s+[^\s:]+:(\d+):\d+/) || content.match(/[/\w\-+.]+[.](js|ts|py|go|rs):(\d+)/);
  if (match) {
    return parseInt(match[match.length - 1], 10);
  }
  return null;
}

export { readLastEntries, findLastToolUse, findLastError, extractTextFromContent, MAX_TRANSCRIPT_LINES };
