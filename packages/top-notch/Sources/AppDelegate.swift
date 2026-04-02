import AppKit

class AppDelegate: NSObject, NSApplicationDelegate {
    private var notificationServer: NotificationServer?
    private var liveActivityManager: LiveActivityManager?

    func applicationDidFinishLaunching(_ notification: Notification) {
        setupLiveActivity()
        setupNotificationServer()
        log("TopNotch started")
    }

    func applicationWillTerminate(_ notification: Notification) {
        notificationServer?.stop()
    }

    private func setupLiveActivity() {
        liveActivityManager = LiveActivityManager()
    }

    private func setupNotificationServer() {
        notificationServer = NotificationServer { [weak self] notification in
            self?.handleNotification(notification)
        }
        notificationServer?.start()
    }

    private func handleNotification(_ notification: HeyAgentNotification) {
        DispatchQueue.main.async {
            self.liveActivityManager?.displayNotification(notification)
            self.showDesktopNotification(notification)
        }
    }

    private func showDesktopNotification(_ notification: HeyAgentNotification) {
        log("Showing desktop notification: \(notification.title)")

        // Use NSUserNotificationCenter for menu bar app
        let userNotification = NSUserNotification()
        userNotification.title = notification.title
        userNotification.informativeText = notification.message
        userNotification.soundName = NSUserNotificationDefaultSoundName

        NSUserNotificationCenter.default.deliver(userNotification)
        log("Notification delivered via NSUserNotificationCenter")
    }

    private func log(_ msg: String) {
        let logPath = NSHomeDirectory() + "/.heyagent/topnotch-debug.log"
        let line = "\(Date()): \(msg)\n"
        if let handle = try? FileHandle(forWritingTo: URL(fileURLWithPath: logPath)) {
            handle.seekToEndOfFile()
            handle.write(line.data(using: .utf8)!)
            handle.closeFile()
        } else {
            try? line.write(toFile: logPath, atomically: true, encoding: .utf8)
        }
        print(msg)
    }
}
