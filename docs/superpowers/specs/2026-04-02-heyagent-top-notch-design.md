# HeyAgent TopNotch - Design Specification

## Overview

Native macOS app that receives HeyAgent notifications and displays them in the Dynamic Island via Live Activities.

## Architecture

```
HeyAgent (Node.js)                  heyagent-top-notch (Swift/macOS)
┌──────────────────┐                ┌──────────────────────────┐
│  Claude/Codex    │                │   Dynamic Island        │
│  hooks trigger   │                │   Live Activity         │
│       ↓          │                │       ↓                │
│  Notification   │── Unix Socket ──│   UserNotifications    │
│  Service        │   ~/.heyagent   │   Framework           │
│                 │   notify.sock   │                       │
└──────────────────┘                └──────────────────────────┘
```

### Components

| Component | Responsibility |
|-----------|----------------|
| `AppDelegate` | App lifecycle, socket setup |
| `NotificationServer` | Unix socket listener |
| `LiveActivityManager` | ActivityKit integration |
| `NotificationParser` | JSON parsing, validation |

## Monorepo Structure

```
heyagent/
├── package.json              # Node.js app (existing)
├── packages/
│   └── top-notch/          # Swift macOS app
│       ├── Sources/
│       └── TopNotch.xcodeproj/
└── shared/                  # Reserved for future shared types
```

## IPC Protocol

**Socket path:** `~/.heyagent/notify.sock`

**Message format:**
```json
{
  "version": "1",
  "type": "notification",
  "payload": {
    "title": "Claude Code waiting",
    "message": "heyagent stopped in ~/project",
    "project": "my-project",
    "timestamp": "2026-04-02T10:30:00Z"
  }
}
```

**Socket lifecycle:**
- `heyagent-top-notch` creates socket at startup
- HeyAgent connects, sends message, closes connection (fire-and-forget)
- App handles malformed messages gracefully

## Dynamic Island / Live Activity

### Idle State (Minimal Presence)
- Tiny HeyAgent icon (16x16) in Dynamic Island
- Indicates app is running

### Expanded View (on notification)
- Project name prominently displayed
- Notification title below project name
- Timestamp

### Long-Press Actions
- "Open Project" - opens project folder in Finder
- "Dismiss" - closes the Live Activity

## Error Handling

- **Socket already in use:** Retry 3 times with 500ms backoff, then log error silently
- **Malformed JSON:** Log warning, ignore message
- **HeyAgent not installed:** App works standalone, no notifications arrive
- **Notification permission denied:** Prompt user to enable in System Settings
- **All other errors:** Silent logging, no UI interruption

## Dependencies

- Swift 5.9+
- ActivityKit (Dynamic Island support)
- UserNotifications framework
- Network framework (Unix socket)

## macOS App Entry Point

Standard `NSApplication.shared.run()` with `AppDelegate`.
