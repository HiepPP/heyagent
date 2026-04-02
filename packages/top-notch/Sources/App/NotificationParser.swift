import Foundation

struct HeyAgentNotification: Codable {
    let title: String
    let message: String
    let project: String
    let timestamp: String

    enum CodingKeys: String, CodingKey {
        case title, message, project, timestamp
    }
}

struct NotificationMessage: Codable {
    let version: String
    let type: String
    let payload: HeyAgentNotification
}

enum NotificationParserError: Error {
    case invalidJSON
    case invalidVersion
    case invalidType
    case missingPayload
}

class NotificationParser {
    func parse(_ data: Data) -> Result<HeyAgentNotification, NotificationParserError> {
        do {
            let decoder = JSONDecoder()
            let message = try decoder.decode(NotificationMessage.self, from: data)

            guard message.version == "1" else {
                return .failure(.invalidVersion)
            }

            guard message.type == "notification" else {
                return .failure(.invalidType)
            }

            return .success(message.payload)
        } catch {
            return .failure(.invalidJSON)
        }
    }

    func parse(_ string: String) -> Result<HeyAgentNotification, NotificationParserError> {
        guard let data = string.data(using: .utf8) else {
            return .failure(.invalidJSON)
        }
        return parse(data)
    }
}
