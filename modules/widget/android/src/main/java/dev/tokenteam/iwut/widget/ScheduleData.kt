package dev.tokenteam.iwut.widget

import android.content.Context
import com.google.gson.Gson
import com.google.gson.annotations.SerializedName
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale
import java.util.concurrent.TimeUnit

data class WidgetCourse(
    @SerializedName("name") val name: String = "",
    @SerializedName("room") val room: String = "",
    @SerializedName("day") val day: Int = 1,
    @SerializedName("weekStart") val weekStart: Int = 1,
    @SerializedName("weekEnd") val weekEnd: Int = 20,
    @SerializedName("sectionStart") val sectionStart: Int = 0,
    @SerializedName("sectionEnd") val sectionEnd: Int = 0,
    @SerializedName("startTime") val startTime: String = "",
    @SerializedName("endTime") val endTime: String = "",
)

data class ScheduleWidgetData(
    @SerializedName("courses") val courses: List<WidgetCourse> = emptyList(),
    @SerializedName("termStart") val termStart: String = "",
    @SerializedName("updatedAt") val updatedAt: String = "",
)

object ScheduleData {
    private val gson = Gson()
    private val DAY_NAMES = arrayOf("", "周一", "周二", "周三", "周四", "周五", "周六", "周日")

    fun load(context: Context): ScheduleWidgetData? {
        val prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
        val json = prefs.getString("schedule", null) ?: return null
        return try {
            gson.fromJson(json, ScheduleWidgetData::class.java)
        } catch (e: Exception) {
            null
        }
    }

    fun getCurrentWeek(termStart: String): Int {
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val startDate = try {
            sdf.parse(termStart) ?: return 1
        } catch (e: Exception) {
            return 1
        }
        val now = Calendar.getInstance().time
        val diffMs = now.time - startDate.time
        if (diffMs < 0) return 0
        val diffDays = TimeUnit.MILLISECONDS.toDays(diffMs)
        return (diffDays / 7 + 1).toInt()
    }

    fun getDayOfWeek(): Int {
        val cal = Calendar.getInstance()
        val dow = cal.get(Calendar.DAY_OF_WEEK)
        return if (dow == Calendar.SUNDAY) 7 else dow - 1
    }

    fun getTomorrowDayOfWeek(): Int {
        val today = getDayOfWeek()
        return if (today == 7) 1 else today + 1
    }

    fun getTomorrowWeek(termStart: String): Int {
        val today = getDayOfWeek()
        val week = getCurrentWeek(termStart)
        return if (today == 7) week + 1 else week
    }

    fun getWeekStr(week: Int): String = "第${week}周"

    fun getDateStr(): String {
        val cal = Calendar.getInstance()
        return "${cal.get(Calendar.MONTH) + 1}月${cal.get(Calendar.DAY_OF_MONTH)}日"
    }

    fun getDayOfWeekStr(day: Int): String = DAY_NAMES.getOrElse(day) { "" }

    fun parseTimeToMinutes(time: String): Int {
        val parts = time.split(":")
        if (parts.size != 2) return 0
        return (parts[0].toIntOrNull() ?: 0) * 60 + (parts[1].toIntOrNull() ?: 0)
    }
}
