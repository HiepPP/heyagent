import path from 'path';
import Logger from '../logger.js';

const logger = new Logger('project');

/**
 * Extract project name from current working directory.
 * Uses the folder name (last path component) of process.cwd().
 *
 * @returns {string} The project name extracted from current directory
 */
export function getProjectName() {
  const cwd = process.cwd();

  // Handle edge case: root directory
  if (cwd === path.parse(cwd).root) {
    logger.warn('Running from root directory, using "root" as project name');
    return 'root';
  }

  // Extract the last path component (folder name)
  const projectName = path.basename(cwd);

  logger.info(`Project name extracted: ${projectName} from ${cwd}`);

  return projectName;
}

/**
 * Replace {project} placeholder in a template string with actual project name.
 *
 * @param {string} template - The template string containing {project} placeholder
 * @returns {string} The string with {project} replaced with actual project name
 */
export function applyProjectTemplate(template) {
  if (!template || typeof template !== 'string') {
    return template;
  }

  const projectName = getProjectName();
  return template.replace(/\{project\}/g, projectName);
}
