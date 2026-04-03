"use strict";

const { AndroidConfig } = require("expo/config-plugins");

const { createBuildGradlePropsConfigPlugin } = AndroidConfig.BuildProperties;

const withGradleProps = createBuildGradlePropsConfigPlugin(
  [
    {
      propName: "org.gradle.jvmargs",
      propValueGetter: () =>
        [
          "-Xmx4096m",
          "-XX:MaxMetaspaceSize=1024m",
          "-XX:+HeapDumpOnOutOfMemoryError",
        ].join(" "),
    },
  ],
  "withGradleProps",
);

module.exports = withGradleProps;
