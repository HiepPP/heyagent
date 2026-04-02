import Foundation

class NotificationServer {
    typealias NotificationHandler = (HeyAgentNotification) -> Void

    private let handler: NotificationHandler
    private let parser = NotificationParser()
    private let socketPath: String
    private var listenerSocket: Int32 = -1
    private var isRunning = false
    private let queue = DispatchQueue(label: "com.heyagent.topnotch.socket")
    private let logPath = NSHomeDirectory() + "/.heyagent/topnotch-debug.log"

    init(handler: @escaping NotificationHandler) {
        self.handler = handler
        self.socketPath = NSHomeDirectory() + "/.heyagent/notify.sock"
        log("NotificationServer init")
    }

    private func log(_ msg: String) {
        let line = "\(Date()): \(msg)\n"
        try? line.write(toFile: logPath, atomically: true, encoding: .utf8)
        print(msg)
    }

    func start() {
        stop()
        queue.async { [weak self] in
            self?.setupSocket()
        }
    }

    func stop() {
        isRunning = false
        if listenerSocket >= 0 {
            close(listenerSocket)
            listenerSocket = -1
        }
        try? FileManager.default.removeItem(atPath: socketPath)
    }

    private func setupSocket() {
        log("Setting up socket at \(socketPath)")

        // Create socket
        listenerSocket = socket(AF_UNIX, SOCK_STREAM, 0)
        guard listenerSocket >= 0 else {
            log("Failed to create socket")
            return
        }

        // Set socket options
        var reuseAddr: Int32 = 1
        setsockopt(listenerSocket, SOL_SOCKET, SO_REUSEADDR, &reuseAddr, socklen_t(MemoryLayout<Int32>.size))

        // Remove existing socket file
        let pathCString = socketPath.cString(using: .utf8)!
        unlink(pathCString)

        // Bind to socket path
        var addr = sockaddr_un()
        addr.sun_family = sa_family_t(AF_UNIX)

        let sunPathSize = Int(MemoryLayout.size(ofValue: addr.sun_path))
        var pathCopy = pathCString
        pathCopy.withUnsafeMutableBufferPointer { pathBuf in
            withUnsafeMutablePointer(to: &addr.sun_path) { dest in
                dest.withMemoryRebound(to: CChar.self, capacity: sunPathSize) { destPtr in
                    strcpy(destPtr, pathBuf.baseAddress!)
                }
            }
        }

        let bindResult = withUnsafePointer(to: &addr) { ptr in
            ptr.withMemoryRebound(to: sockaddr.self, capacity: 1) { sockaddrPtr in
                bind(listenerSocket, sockaddrPtr, socklen_t(MemoryLayout<sockaddr_un>.size))
            }
        }

        guard bindResult >= 0 else {
            log("Failed to bind socket: \(String(cString: strerror(errno)))")
            close(listenerSocket)
            listenerSocket = -1
            return
        }

        // Listen for connections
        guard listen(listenerSocket, 5) >= 0 else {
            log("Failed to listen on socket")
            close(listenerSocket)
            listenerSocket = -1
            return
        }

        // Set non-blocking
        let flags = fcntl(listenerSocket, F_GETFL, 0)
        _ = fcntl(listenerSocket, F_SETFL, flags | O_NONBLOCK)

        isRunning = true
        log("NotificationServer listening on \(socketPath)")

        acceptConnections()
    }

    private func acceptConnections() {
        while isRunning {
            var clientAddr = sockaddr_un()
            var addrLen = socklen_t(MemoryLayout<sockaddr_un>.size)

            let clientSocket = withUnsafeMutablePointer(to: &clientAddr) { ptr in
                ptr.withMemoryRebound(to: sockaddr.self, capacity: 1) { sockaddrPtr in
                    accept(listenerSocket, sockaddrPtr, &addrLen)
                }
            }

            if clientSocket >= 0 {
                handleClient(clientSocket)
            } else {
                if errno != EAGAIN && errno != EWOULDBLOCK {
                    log("Accept error: \(String(cString: strerror(errno)))")
                }
                usleep(100000) // 100ms
            }
        }
    }

    private func handleClient(_ clientSocket: Int32) {
        defer { close(clientSocket) }

        var buffer = [UInt8](repeating: 0, count: 65536)
        let bytesRead = read(clientSocket, &buffer, buffer.count)

        if bytesRead > 0 {
            log("Received \(bytesRead) bytes from client")
            let data = Data(bytes: buffer, count: bytesRead)
            processData(data)
        } else {
            log("No data read from client")
        }
    }

    private func processData(_ data: Data) {
        log("Processing \(data.count) bytes of data")

        // Try to parse as JSON array of messages or single message
        if let jsonArray = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]],
           let jsonData = try? JSONSerialization.data(withJSONObject: jsonArray.first ?? [:]) {
            log("Parsed JSON array, handling first element")
            handleData(jsonData)
        } else {
            log("Parsing as single JSON object")
            handleData(data)
        }
    }

    private func handleData(_ data: Data) {
        let result = parser.parse(data)

        switch result {
        case .success(let notification):
            log("Parsed notification: \(notification.title) - \(notification.message)")
            DispatchQueue.main.async {
                self.handler(notification)
            }
        case .failure(let error):
            switch error {
            case .invalidJSON:
                log("Error: Received malformed JSON")
            case .invalidVersion:
                log("Error: Invalid message version")
            case .invalidType:
                log("Error: Invalid message type")
            case .missingPayload:
                log("Error: Missing payload")
            }
        }
    }
}
