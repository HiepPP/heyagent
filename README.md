# HeyAgent

### Get notified when Claude Code and other CLI coding agents need your attention!

HeyAgent supports most of the CLI coding agents, use it for free!

## Features

- **Context-aware notifications** - Know WHY your agent stopped with error details, file paths, and actionable suggestions
- **Project-aware** - Notifications show your project name for easy identification
- **Multi-channel support** - Desktop, Email, Slack, Telegram, WhatsApp, and custom webhooks
- **Universal agent support** - Works with Claude Code, Codex CLI, Gemini, Droid, and more

## Installation

Install globally via npm:

```bash
npm install -g heyagent
```

## Quick Start

1. Install the package globally
2. Run `hey claude` to start Claude Code with notifications
3. Or run `hey codex` to start OpenAI Codex CLI with notifications
4. Or run `hey gemini/droid/...` to start any CLI agent with notifications

## Usage

### Basic Commands

```bash
# Start Claude Code with notifications
hey claude

# Start Codex CLI with notifications
hey codex

# Start Gemini CLI with notifications
hey gemini

# Start basically any CLI coding agent with notifications!
hey [YOUR-AGENT]

# Pass arguments to Claude/Codex
hey claude --help
hey claude -c    # Continue last session
hey codex resume --latest    # Continue last session

# Configure notification settings
hey config

# Manage license for paid notification channels
hey license

# Toggle notifications
hey on           # Enable notifications
hey off          # Disable notifications

# Setup without starting Claude (hooks and slash commands)
hey setup claude

# Show help
hey help
```

### Notification Methods

HeyAgent supports multiple notification methods:

- **Desktop notifications** (default)
- **Email notifications\***
- **WhatsApp notifications\***
- **Telegram notifications\***
- **Slack notifications\***
- **Custom webhook notifications**

Configure your preferred method with `hey config`.

\*Pro notification channels require a license. Run `hey license` to set up.

### Slash Commands (within Claude Code only)

While Claude is running, you can use:

```
/hey on          # Enable notifications
/hey off         # Disable notifications
```

## How It Works

HeyAgent wraps your CLI coding agent sessions and provides intelligent notifications:

### Claude Code Integration

HeyAgent uses Claude Code's hooks and slash commands for event-driven notifications:

- **Stop events** - Notifies when Claude finishes responding
- **Permission prompts** - Alerts when Claude needs approval for tool use
- **Idle detection** - Notifies when Claude is waiting for input after 60+ seconds
- **Context-aware analysis** - Parses transcript to detect errors and provide actionable suggestions

### Other Agents

For Codex CLI and other agents, HeyAgent listens to stdout and sends notifications after periods of inactivity.

### Smart Notification Examples

Instead of generic "agent stopped" messages, HeyAgent provides:

```
# Error notification
"heyagent - Error
Fix syntax error in src/auth.ts:42"

# Permission notification
"myproject - Approval needed
Bash command requires approval"

# Completion notification
"myproject completed
Task finished successfully"
```

### Webhook Integration

For webhook notifications, HeyAgent sends rich JSON payloads:

```json
{
  "scenario": "error",
  "project": "myproject",
  "error": {
    "type": "SyntaxError",
    "file": "src/auth.ts",
    "line": 42
  },
  "suggestions": [{ "label": "View file", "hint": "Open src/auth.ts" }]
}
```

## Requirements

- Node.js 18 or higher
- Claude Code CLI or OpenAI Codex CLI installed
- HeyAgent license for paid notification channels

## Support

- Official website: https://heyagent.dev
- Issues: Report bugs and feature requests on GitHub

## License

MIT License - see LICENSE file for details.
