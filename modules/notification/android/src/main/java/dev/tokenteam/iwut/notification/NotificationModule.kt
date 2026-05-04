package dev.tokenteam.iwut.notification

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NotificationModule : Module() {
    private val notificationManager: NotificationManager?
        get() = appContext.reactContext?.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager

    private val alarmManager: AlarmManager?
        get() = appContext.reactContext?.getSystemService(Context.ALARM_SERVICE) as? AlarmManager

    override fun definition() = ModuleDefinition {
        Name("Notification")

        AsyncFunction("createChannel") { id: String, name: String, description: String ->
            val manager = notificationManager ?: return@AsyncFunction
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(id, name, NotificationManager.IMPORTANCE_HIGH).apply {
                    this.description = description
                }
                manager.createNotificationChannel(channel)
            }
        }

        AsyncFunction("showCountdown") { id: Int, channelId: String, title: String, body: String, targetTimeMs: Double, ongoing: Boolean, autoDismiss: Boolean ->
            val context = appContext.reactContext ?: return@AsyncFunction
            val target = targetTimeMs.toLong()

            val notification = buildCountdownNotification(context, channelId, title, body, target, ongoing)
            notificationManager?.notify(id, notification)

            if (autoDismiss) {
                scheduleDismiss(context, id, target)
            }
        }

        AsyncFunction("scheduleCountdown") { id: Int, channelId: String, title: String, body: String, triggerAtMs: Double, targetTimeMs: Double, ongoing: Boolean, autoDismiss: Boolean ->
            val context = appContext.reactContext ?: return@AsyncFunction
            val trigger = triggerAtMs.toLong()

            val intent = Intent(context, CountdownReceiver::class.java).apply {
                action = "dev.tokenteam.iwut.notification.SHOW_COUNTDOWN"
                putExtra("id", id)
                putExtra("channelId", channelId)
                putExtra("title", title)
                putExtra("body", body)
                putExtra("targetTimeMs", targetTimeMs.toLong())
                putExtra("ongoing", ongoing)
                putExtra("autoDismiss", autoDismiss)
            }

            val pendingIntent = PendingIntent.getBroadcast(
                context, id, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            alarmManager?.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP, trigger, pendingIntent
            )

            trackScheduledId(context, id)
        }

        AsyncFunction("cancel") { id: Int ->
            val context = appContext.reactContext ?: return@AsyncFunction
            notificationManager?.cancel(id)
            cancelScheduledAlarm(context, id)
            removeTrackedId(context, id)
        }

        AsyncFunction("cancelAll") {
            val context = appContext.reactContext ?: return@AsyncFunction
            notificationManager?.cancelAll()
            cancelAllScheduledAlarms(context)
        }
    }

    private fun buildCountdownNotification(
        context: Context,
        channelId: String,
        title: String,
        body: String,
        targetTimeMs: Long,
        ongoing: Boolean,
    ): android.app.Notification {
        val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
        val contentIntent = PendingIntent.getActivity(
            context, 0, launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(context, channelId)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setWhen(targetTimeMs)
            .setUsesChronometer(true)
            .setChronometerCountDown(true)
            .setOngoing(ongoing)
            .setContentIntent(contentIntent)
            .setAutoCancel(!ongoing)
            .build()
    }

    private fun scheduleDismiss(context: Context, id: Int, targetTimeMs: Long) {
        val intent = Intent(context, CountdownReceiver::class.java).apply {
            action = "dev.tokenteam.iwut.notification.DISMISS"
            putExtra("id", id)
        }
        val pendingIntent = PendingIntent.getBroadcast(
            context, id + 100000, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        alarmManager?.setExactAndAllowWhileIdle(
            AlarmManager.RTC_WAKEUP, targetTimeMs, pendingIntent
        )
    }

    private fun cancelScheduledAlarm(context: Context, id: Int) {
        val intent = Intent(context, CountdownReceiver::class.java)
        val pendingIntent = PendingIntent.getBroadcast(
            context, id, intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )
        pendingIntent?.let { alarmManager?.cancel(it) }
    }

    private fun cancelAllScheduledAlarms(context: Context) {
        val ids = getTrackedIds(context)
        for (id in ids) {
            cancelScheduledAlarm(context, id)
            val dismissIntent = Intent(context, CountdownReceiver::class.java)
            val dismissPending = PendingIntent.getBroadcast(
                context, id + 100000, dismissIntent,
                PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
            )
            dismissPending?.let { alarmManager?.cancel(it) }
        }
        clearTrackedIds(context)
    }

    companion object {
        private const val PREFS_NAME = "notification_ids"
        private const val KEY_IDS = "scheduled_ids"

        fun trackScheduledId(context: Context, id: Int) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val ids = prefs.getStringSet(KEY_IDS, mutableSetOf()) ?: mutableSetOf()
            val updated = ids.toMutableSet()
            updated.add(id.toString())
            prefs.edit().putStringSet(KEY_IDS, updated).apply()
        }

        fun getTrackedIds(context: Context): Set<Int> {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val ids = prefs.getStringSet(KEY_IDS, emptySet()) ?: emptySet()
            return ids.mapNotNull { it.toIntOrNull() }.toSet()
        }

        fun removeTrackedId(context: Context, id: Int) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val ids = prefs.getStringSet(KEY_IDS, mutableSetOf()) ?: mutableSetOf()
            val updated = ids.toMutableSet()
            updated.remove(id.toString())
            prefs.edit().putStringSet(KEY_IDS, updated).apply()
        }

        fun clearTrackedIds(context: Context) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().remove(KEY_IDS).apply()
        }
    }
}
