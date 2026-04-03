#!/bin/bash
set -e

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

PROFILE="$1"

if [ -z "$PROFILE" ]; then
  echo "Usage: $0 <profile>"
  exit 1
fi

for cmd in java:openjdk-17-jdk unzip:unzip wget:wget; do
  command -v "${cmd%%:*}" &> /dev/null || PKGS+=" ${cmd##*:}"
done
if [ -n "$PKGS" ]; then
  apt-get update && apt-get install -y $PKGS
fi

export ANDROID_HOME=/opt/android-sdk
export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH

if ! command -v sdkmanager &> /dev/null; then
  mkdir -p /opt/android-sdk/cmdline-tools
  wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/tools.zip
  unzip /tmp/tools.zip -d /opt/android-sdk/cmdline-tools
  mv /opt/android-sdk/cmdline-tools/cmdline-tools /opt/android-sdk/cmdline-tools/latest
  rm /tmp/tools.zip
fi

if [ ! -d "$ANDROID_HOME/platforms/android-36" ]; then
  yes | sdkmanager --licenses
  sdkmanager --install \
    "platform-tools" \
    "platforms;android-36" \
    "build-tools;36.0.0" \
    "ndk;27.1.12297006"
fi

if ! command -v eas &> /dev/null; then
  npm install -g eas-cli
fi

yarn install

eas build --profile "$PROFILE" --platform android --local
