import ActivityKit
import WidgetKit
import SwiftUI

struct TopNotchLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: NotificationAttributes.self) { context in
            // Notification Center / banner view
            HStack {
                Image(systemName: "bubble.left.and.bubble.right.fill")
                    .foregroundColor(.blue)
                    .font(.title2)

                VStack(alignment: .leading, spacing: 4) {
                    Text(context.state.project)
                        .font(.headline)
                        .foregroundColor(.primary)

                    Text(context.state.title)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .lineLimit(1)

                    Text(context.state.timestamp, style: .relative)
                        .font(.caption)
                        .foregroundColor(.tertiary)
                }

                Spacer()
            }
            .padding()
            .activityBackgroundTint(.black.opacity(0.8))
            .activitySystemActionForegroundColor(.white)
        }
    }
}
