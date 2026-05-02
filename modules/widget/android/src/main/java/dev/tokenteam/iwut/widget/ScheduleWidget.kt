package dev.tokenteam.iwut.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.view.View
import android.widget.RemoteViews
import java.util.Calendar

class ScheduleWidget : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        for (id in appWidgetIds) {
            updateWidget(context, appWidgetManager, id)
        }
    }

    companion object {
        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int,
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_schedule)
            val data = ScheduleData.load(context)

            val weekStr = data?.weekStr ?: ""
            val dateStr = data?.dateStr ?: ""
            val dayOfWeekStr = data?.dayOfWeekStr ?: ""

            views.setTextViewText(R.id.tv_week, weekStr)
            views.setTextViewText(R.id.tv_date, dateStr)
            views.setTextViewText(R.id.tv_day_of_week, dayOfWeekStr)

            val todayCourses = data?.todayCourses ?: emptyList()
            val tomorrowCourses = data?.tomorrowCourses ?: emptyList()

            val now = Calendar.getInstance()
            val nowMin = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)

            val upcomingToday = todayCourses.filter { parseTimeToMinutes(it.endTime) > nowMin }
            val combined = (upcomingToday + tomorrowCourses).take(2)

            if (combined.isEmpty()) {
                views.setViewVisibility(R.id.course_group, View.GONE)
                views.setViewVisibility(R.id.all_done_group, View.VISIBLE)
                appWidgetManager.updateAppWidget(appWidgetId, views)
                return
            }

            views.setViewVisibility(R.id.course_group, View.VISIBLE)
            views.setViewVisibility(R.id.all_done_group, View.GONE)

            val c1 = combined[0]
            views.setViewVisibility(R.id.course_row_1, View.VISIBLE)
            views.setTextViewText(R.id.course_1_name, c1.name)
            views.setTextViewText(R.id.course_1_tag, if (c1.isToday) "今天" else "明天")
            views.setTextViewText(R.id.course_1_room, c1.room)
            views.setTextViewText(R.id.course_1_time, "${c1.startTime}-${c1.endTime}")

            if (combined.size > 1) {
                val c2 = combined[1]
                views.setViewVisibility(R.id.course_row_2, View.VISIBLE)
                views.setViewVisibility(R.id.tv_no_more, View.GONE)
                views.setTextViewText(R.id.course_2_name, c2.name)
                views.setTextViewText(R.id.course_2_tag, if (c2.isToday) "今天" else "明天")
                views.setTextViewText(R.id.course_2_room, c2.room)
                views.setTextViewText(R.id.course_2_time, "${c2.startTime}-${c2.endTime}")
            } else {
                views.setViewVisibility(R.id.course_row_2, View.GONE)
                views.setViewVisibility(R.id.tv_no_more, View.VISIBLE)
            }

            val hintText: String
            if (upcomingToday.isEmpty() && tomorrowCourses.isEmpty()) {
                hintText = "今天和明天都没有课啦～"
            } else {
                val todayHint = if (upcomingToday.isEmpty()) "今天没有课啦，" else "今天还有${upcomingToday.size}节课，"
                val tomorrowHint = if (tomorrowCourses.isEmpty()) "明天没有课啦～" else "明天还有${tomorrowCourses.size}节课"
                hintText = todayHint + tomorrowHint
            }
            views.setViewVisibility(R.id.tv_course_hint, View.VISIBLE)
            views.setTextViewText(R.id.tv_course_hint, hintText)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        private fun parseTimeToMinutes(time: String): Int {
            val parts = time.split(":")
            if (parts.size != 2) return 0
            return (parts[0].toIntOrNull() ?: 0) * 60 + (parts[1].toIntOrNull() ?: 0)
        }
    }
}
