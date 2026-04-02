import Foundation

// Shared notification data structure
// Note: ActivityKit (Dynamic Island / Live Activities) is not available on macOS

struct NotificationAttributes: Codable, Hashable {
    var title: String
    var message: String
    var project: String
    var timestamp: Date

    init(title: String, message: String, project: String, timestamp: Date) {
        self.title = title
        self.message = message
        self.project = project
        self.timestamp = timestamp
    }

    init(from notification: HeyAgentNotification) {
        self.title = notification.title
        self.message = notification.message
        self.project = notification.project
        let formatter = ISO8601DateFormatter()
        self.timestamp = formatter.date(from: notification.timestamp) ?? Date()
    }
}
