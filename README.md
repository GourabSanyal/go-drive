# 🚘 Go Cabs Driver App

This is the **Driver App** for Go Cabs — the decentralized ride-hailing platform built on sustainability, transparency, and fair economics. It empowers EV drivers with full control of their income, direct rider interactions, and zero platform commissions.

---
## Rider app repository : https://github.com/codewithnazim/go-cabs-native

# 🌟 Key Features

- 📲 **Live Ride Requests**  
  Receive incoming ride requests in real-time with route, distance, and rider info.

- 💬 **Fare Negotiation**  
  Set your own price or counter rider offers through an in-app bid system.

- 👥 **Community Page**  
  Access community insights and rider reviews — build your reputation on-chain.

- 💰 **Earnings Dashboard**  
  Track daily, weekly, and all-time earnings, transparently and commission-free.

- 🛻 **Vehicle & Profile Info**  
  Manage your EV details, licenses, and ID credentials in one clean dashboard.

---

# ⚙️ Tech Stack

| Tech                      | Purpose                           |
|---------------------------|-----------------------------------|
| React Native + TypeScript | Mobile app for drivers            |
| Firebase Auth             | Secure login                      |
| Firebase Realtime DB      | Live request syncing              |
| Socket.IO                 | Real-time rider-driver matching   |
| Mapbox API                | Location input & mapping          |
| Anchor                    | On-chain escrow wallet (Solana)   |
| OpenCharge API            | EV charging station locator       |

---

📱 Live Demo 
🎥 Watch the full App demo on YouTube:  
[![Watch Now](https://www.youtube.com/watch?v=E5tLv4YkVqs&t=3s/hqdefault.jpg)](https://www.youtube.com/watch?v=E5tLv4YkVqs&t=3s)  
🔗 [Click here to watch](https://www.youtube.com/watch?v=E5tLv4YkVqs&t=3s)

- Waitlist: Join Now at https://www.gocabs.xyz/

- Telegram Community: https://t.me/GoCabsTG

# 🚀 Getting Started (For Developers)

1. Use node version: `LTS 22.11.0`
2. yarn version: `4.5.3 or >= 4`

Make sure to add your Android SDK location in `android/local.properties` > `sdk.dir` [eg: sdk.dir=/Users/username/Library/Android/sdk]

## Install packages
  1. Run at the root of the project: `yarn install`
  2. Install pods: `cd ios && pod install`

## Run iOS and Android
  1. Start server: `yarn start`
  2. Start IOS emulator: `i`, Android emulator: `a`
  3. If you want to get a dev build without starting the server first, run `yarn run ios` for iOS dev build, and `yarn run android` for Android build
  4. You can create dev builds using the USB debugger option. [Read the documentation](https://reactnative.dev/docs/running-on-device)

## Use EAS developer build from Expo Dev Dashboard
1. Go through this link first if you are not familiar with EAS build: https://docs.expo.dev/develop/development-builds/create-a-build/
2. Log in to your EAS account from the terminal.
3. iOS: EAS build number `f93736c1` (iOS simulator build), from the Expo dev dashboard,  start with `Open with Orbit`.
4. Android: EAS build number `19028b4d` (Android internal distribution build), from the Expo dev dashboard, and then install on the device.

 ## Use Prebuild - when and how?

 1. Prebuild generates iOS and Android native projects: `yarn run prebuild`
 2. If there is a new module/config/plug-in that makes changes in `app.json`, always generate a clean build using: `yarn run rebuild --clean`
 3. This wipes out previous builds of Android and iOS and generates new native projects.

## Test release
### XCode
1. Open `godrive.scworkspace` in Xcode > click on top bar `godrive` > edit scheme > change to 'Release'. Make sure to change the sign-in capabilities in the project target. Then run using the run button or `Cmd + R`, generating a release version of the app on the emulator.
