import WidgetKit

struct ScheduleEntry: TimelineEntry {
    let date: Date
    let data: ScheduleWidgetData?

    var courses: [WidgetCourse] {
        guard let data = data else { return [] }
        let today = data.todayCourses
        if !today.isEmpty { return today }
        return data.tomorrowCourses
    }

    var isShowingTomorrow: Bool {
        guard let data = data else { return false }
        return data.todayCourses.isEmpty && !data.tomorrowCourses.isEmpty
    }
}

struct ScheduleTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> ScheduleEntry {
        ScheduleEntry(date: .now, data: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (ScheduleEntry) -> Void) {
        let entry = ScheduleEntry(date: .now, data: ScheduleWidgetData.load())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ScheduleEntry>) -> Void) {
        let entry = ScheduleEntry(date: .now, data: ScheduleWidgetData.load())
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: .now) ?? .now
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }
}
