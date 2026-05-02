import SwiftUI
import WidgetKit

struct ScheduleWidget: Widget {
    let kind: String = "ScheduleWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ScheduleTimelineProvider()) { entry in
            if #available(iOS 17.0, *) {
                ScheduleWidgetEntryView(entry: entry)
                    .containerBackground(Color("WidgetBackground"), for: .widget)
            } else {
                ScheduleWidgetEntryView(entry: entry)
                    .background(Color("WidgetBackground"))
            }
        }
        .contentMarginsDisabled()
        .configurationDisplayName("课程表")
        .description("今天有什么课？看这里就够啦～")
        .supportedFamilies([.systemMedium])
    }
}
