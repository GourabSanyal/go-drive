# go-drive
Driver application for GoCabs

1. Use node version: `LTS 22.11.0`
2. yarn version: `4.5.3 or >= 4`

Make sure to add your Android SDK location in `android/local.properties` > `sdk.dir` [eg: sdk.dir=/Users/username/Library/Android/sdk]

## Install packages
  1. Run at the root of the project: `yarn install`
  2. Install pods: `cd ios && pod install`

## Use EAS developer build from Expo Dev Dashboard
1. Go through this link first if you are not familiar with EAS build: https://docs.expo.dev/develop/development-builds/create-a-build/
2. Log in to your EAS account from the terminal.
3. IOS: EAS build number `f93736c1` (ios simulator build), from the Expo dev dashboard,  start with `Open with Orbit`.
4. Android: EAS build number `19028b4d` (Android internal distribution build), from the Expo dev dashboard, and then install on the device.

 ## Use Prebuild - when and how?

 1. Prebuild generates iOS and Android native projects: `yarn run prebuild`
 2. If there is a new module/config/plug-in that makes changes in `app.json`, always generate a clean build using: `yarn run rebuild --clean`
 3. This wipes out previous builds of Android and iOS and generates new native projects.

## Test release
### XCode
1. Open `godrive.scworkspace` in Xcode > click on top bar `godrive` > edit scheme > change to 'Release'. Make sure to change the sign-in capabilities in the project target. Then run using the run button or `Cmd + R`, generating a release version of the app on the emulator.
