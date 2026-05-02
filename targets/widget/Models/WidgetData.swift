import Foundation

struct WidgetCourse: Codable {
    let name: String
    let room: String
    let teacher: String
    let sectionStart: Int
    let sectionEnd: Int
    let startTime: String
    let endTime: String
    let isToday: Bool
}

struct ScheduleWidgetData: Codable {
    let todayCourses: [WidgetCourse]
    let tomorrowCourses: [WidgetCourse]
    let dayOfWeek: Int
    let week: Int
    let weekStr: String
    let dateStr: String
    let dayOfWeekStr: String
    let updatedAt: String

    static func load() -> ScheduleWidgetData? {
        guard let defaults = UserDefaults(suiteName: "group.dev.tokenteam.iwut"),
              let json = defaults.string(forKey: "schedule"),
              let data = json.data(using: .utf8)
        else { return nil }

        return try? JSONDecoder().decode(ScheduleWidgetData.self, from: data)
    }
}
