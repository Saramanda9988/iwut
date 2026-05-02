package dev.tokenteam.iwut.networkreporter

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NetworkReporterModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("NetworkReporter")

        AsyncFunction("reportWifiConnectivity") { hasConnectivity: Boolean ->
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
                return@AsyncFunction false
            }

            val context = appContext.reactContext ?: return@AsyncFunction false
            val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE)
                as? ConnectivityManager ?: return@AsyncFunction false

            @Suppress("DEPRECATION")
            val wifi = cm.allNetworks.firstOrNull {
                cm.getNetworkCapabilities(it)?.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) == true
            } ?: return@AsyncFunction false

            runCatching { cm.reportNetworkConnectivity(wifi, hasConnectivity) }.isSuccess
        }
    }
}
