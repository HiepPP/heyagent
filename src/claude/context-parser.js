import path from 'path';
import Logger from '../logger.js';
import { readLastEntries, findLastToolUse, findLastError } from './transcript-reader.js';

const logger = new Logger('context-parser');

async function parseHookPayload(hookData) {
  if (!hookData || typeof hookData !== 'object') {
    throw new Error('Invalid hook data');
  }

  const context = {
    session_id: hookData.session_id || null,
    transcript_path: expandHomePath(hookData.transcript_path),
    cwd: hookData.cwd || process.cwd(),
    permission_mode: hookData.permission_mode || 'default',
    hook_event_name: hookData.hook_event_name || 'Unknown',
    notification_type: hookData.notification_type || null,
    message: hookData.message || null,
    stop_hook_active: hookData.stop_hook_active || false,
    project: null,
    lastToolUse: null,
    lastError: null,
    transcriptEntries: [],
  };

  context.project = getProjectNameFromCwd(context.cwd);

  if (context.transcript_path) {
    const entries = await readLastEntries(context.transcript_path);
    context.transcriptEntries = entries;
    context.lastToolUse = findLastToolUse(entries);
    context.lastError = findLastError(entries);
  }

  logger.info(`Parsed hook context: ${context.hook_event_name}, project: ${context.project}`);

  return context;
}

function expandHomePath(filePath) {
  if (!filePath) return null;
  if (filePath.startsWith('~')) {
    return path.join(process.env.HOME || '', filePath.slice(1));
  }
  return filePath;
}

function getProjectNameFromCwd(cwd) {
  if (!cwd) return 'unknown';
  try {
    return path.basename(cwd);
  } catch {
    return 'unknown';
  }
}

export { parseHookPayload };
