import Foundation

// LiveActivityManager handles displaying notifications via UserNotifications
// Note: ActivityKit (Dynamic Island / Live Activities) is not available on macOS
// Live Activities are iOS/iPadOS only

class LiveActivityManager {
    func displayNotification(_ notification: HeyAgentNotification) {
        // Notification is already displayed via UNUserNotificationCenter in AppDelegate
        // This manager exists for future extensibility if macOS adds Live Activity support
    }
}
