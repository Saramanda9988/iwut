import { requireNativeModule } from "expo-modules-core";

interface WidgetNativeModule {
  setWidgetData(key: string, json: string): Promise<void>;
  reloadWidgets(): Promise<void>;
}

const WidgetModule = requireNativeModule<WidgetNativeModule>("Widget");

export async function setWidgetData(
  key: string,
  data: Record<string, unknown>,
): Promise<void> {
  await WidgetModule.setWidgetData(key, JSON.stringify(data));
}

export async function reloadWidgets(): Promise<void> {
  await WidgetModule.reloadWidgets();
}
