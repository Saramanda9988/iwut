import ExpoModulesCore

public class NotificationModule: Module {
    public func definition() -> ModuleDefinition {
        Name("Notification")

        AsyncFunction("createChannel") { (_: String, _: String, _: String) in
            // Android only, no-op on iOS
        }

        AsyncFunction("showCountdown") { (_: Int, _: String, _: String, _: String, _: Double, _: Bool, _: Bool) in
            // TODO: Implement iOS Live Activity
        }

        AsyncFunction("scheduleCountdown") { (_: Int, _: String, _: String, _: String, _: Double, _: Double, _: Bool, _: Bool) in
            // TODO: Implement iOS Live Activity scheduling
        }

        AsyncFunction("cancel") { (_: Int) in
            // TODO: Implement iOS Live Activity cancellation
        }

        AsyncFunction("cancelAll") { () in
            // TODO: Implement iOS Live Activity cleanup
        }
    }
}
