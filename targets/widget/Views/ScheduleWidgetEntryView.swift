import SwiftUI
import WidgetKit

struct ScheduleWidgetEntryView: View {
    var entry: ScheduleTimelineProvider.Entry

    private var courses: [WidgetCourse] {
        entry.courses
    }

    private var bottomText: String {
        guard let data = entry.data else { return "" }
        if courses.isEmpty { return "" }

        if data.todayCourses.isEmpty && data.tomorrowCourses.isEmpty {
            return "今天和明天都没有课啦～"
        }

        let todayPart: String
        if data.todayCourses.isEmpty {
            todayPart = "今天没有课啦，"
        } else {
            todayPart = "今天还有\(data.todayCourses.count)节课，"
        }

        let tomorrowPart: String
        if data.tomorrowCourses.isEmpty {
            tomorrowPart = "明天没有课啦～"
        } else {
            tomorrowPart = "明天还有\(data.tomorrowCourses.count)节课"
        }

        return todayPart + tomorrowPart
    }

    var body: some View {
        ZStack {
            WidgetBackgroundView(isEmpty: courses.isEmpty)

            HStack(spacing: 12) {
                if let data = entry.data {
                    DateInfoView(
                        weekStr: data.weekStr,
                        dateStr: data.dateStr,
                        dayOfWeekStr: data.dayOfWeekStr
                    )
                } else {
                    DateInfoView(
                        weekStr: "第-周",
                        dateStr: "--月--日",
                        dayOfWeekStr: "--"
                    )
                }

                VStack(alignment: .leading, spacing: 0) {
                    if courses.isEmpty {
                        EmptyCourseView()
                    }

                    ForEach(courses.prefix(2).indices, id: \.self) { index in
                        if index > 0 {
                            Divider()
                                .padding(.vertical, 8)
                        }
                        CourseInfoView(course: courses[index])
                    }

                    if courses.count == 1 {
                        Text("没有更多课啦～")
                            .foregroundColor(Color("TextPrimary"))
                            .font(.system(size: 12))
                            .padding(.top, 8)
                    }

                    Spacer()

                    if !bottomText.isEmpty {
                        Text(bottomText)
                            .foregroundColor(Color("TextSecondary"))
                            .font(.system(size: 12))
                    }
                }
            }
            .padding(16)
        }
    }
}
