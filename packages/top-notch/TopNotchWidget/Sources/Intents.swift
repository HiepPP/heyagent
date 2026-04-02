import AppIntents
import Foundation

struct OpenProjectIntent: AppIntent {
    static var title: LocalizedStringResource = "Open Project"

    @Parameter(title: "Project")
    var project: String

    init() {
        self.project = ""
    }

    init(project: String) {
        self.project = project
    }

    func perform() async throws -> some IntentResult {
        // Opening files from widget extension is not directly supported
        // The main app will handle this via URL scheme if needed
        return .result()
    }
}

struct DismissNotificationIntent: AppIntent {
    static var title: LocalizedStringResource = "Dismiss Notification"

    func perform() async throws -> some IntentResult {
        return .result()
    }
}
