/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: "widget",
  name: "ScheduleWidget",
  deploymentTarget: "16.2",
  frameworks: ["ActivityKit"],
  entitlements: {
    "com.apple.security.application-groups": ["group.dev.tokenteam.iwut"],
  },
};
