import Logger from '../logger.js';
import { getTemplate, substituteVariables, substituteActionVariables } from './suggestion-templates.js';

const logger = new Logger('suggestion-engine');

function generate(scenario, context) {
  if (!scenario || !context) {
    return getDefaultSuggestion(context);
  }

  try {
    const template = getTemplate(scenario.scenario, scenario.subtype);
    const primary = substituteVariables(template, context);

    const actions = (template.actions || []).map(action => substituteActionVariables(action, context));

    return {
      primary,
      actions,
      scenario: scenario.scenario,
      subtype: scenario.subtype,
    };
  } catch (error) {
    logger.error(`Error generating suggestion: ${error.message}`);
    return getDefaultSuggestion(context);
  }
}

function getDefaultSuggestion(context) {
  return {
    primary: `${context.project || 'Project'} is waiting for you`,
    actions: [
      { label: 'Check terminal', hint: 'Review status' },
      { label: 'Respond', hint: 'Provide input' },
    ],
    scenario: 'unknown',
    subtype: null,
  };
}

function formatForNotification(suggestion) {
  if (!suggestion) {
    return { primary: '', actions: [] };
  }

  const actionHints = suggestion.actions
    .map(a => a.hint)
    .filter(h => h)
    .slice(0, 2);

  return {
    primary: suggestion.primary,
    actions: actionHints,
    scenario: suggestion.scenario,
  };
}

export { generate, getDefaultSuggestion, formatForNotification };
