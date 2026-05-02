package dev.tokenteam.iwut.widget

import android.content.Context
import com.google.gson.Gson

data class WidgetCourse(
    val name: String = "",
    val room: String = "",
    val teacher: String = "",
    val sectionStart: Int = 0,
    val sectionEnd: Int = 0,
    val startTime: String = "",
    val endTime: String = "",
    val isToday: Boolean = true,
)

data class ScheduleWidgetData(
    val todayCourses: List<WidgetCourse> = emptyList(),
    val tomorrowCourses: List<WidgetCourse> = emptyList(),
    val dayOfWeek: Int = 1,
    val week: Int = 1,
    val weekStr: String = "",
    val dateStr: String = "",
    val dayOfWeekStr: String = "",
    val updatedAt: String = "",
)

object ScheduleData {
    private val gson = Gson()

    fun load(context: Context): ScheduleWidgetData? {
        val prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
        val json = prefs.getString("schedule", null) ?: return null

        return try {
            gson.fromJson(json, ScheduleWidgetData::class.java)
        } catch (e: Exception) {
            null
        }
    }
}
