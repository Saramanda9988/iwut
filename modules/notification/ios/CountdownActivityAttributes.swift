import ActivityKit
import Foundation

@available(iOS 16.2, *)
public struct CountdownActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable & Hashable {
        public let targetTime: Date
    }

    public let title: String
    public let subtitle: String
}
