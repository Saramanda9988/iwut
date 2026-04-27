import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

interface NetworkReporterNativeModule {
  reportWifiConnectivity(hasConnectivity: boolean): Promise<boolean>;
}

const NetworkReporter =
  Platform.OS === "android"
    ? requireNativeModule<NetworkReporterNativeModule>("NetworkReporter")
    : null;

/**
 * Ask Android to re-evaluate the current Wi-Fi network's connectivity.
 *
 * Android-only; resolves `false` on other platforms or when no Wi-Fi is found.
 *
 * @param hasConnectivity Whether the network has working connectivity. Defaults to `true`.
 * @returns `true` if the report was submitted, `false` otherwise.
 */
export async function reportWifiConnectivity(
  hasConnectivity = true,
): Promise<boolean> {
  return NetworkReporter?.reportWifiConnectivity(hasConnectivity) ?? false;
}
