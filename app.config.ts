import { ConfigContext, ExpoConfig } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    return "com.yourname.stickersmash.dev";
  }

  if (IS_PREVIEW) {
    return "com.yourname.stickersmash.preview";
  }

  return "com.yourname.stickersmash";
};

const getAppName = () => {
  if (IS_DEV) {
    return "StickerSmash (Dev)";
  }

  if (IS_PREVIEW) {
    return "StickerSmash (Preview)";
  }

  return "StickerSmash: Emoji Stickers";
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "go-cabs-and-drive",
  version: "0.0.1",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "drive",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  jsEngine: "hermes",
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    googleServicesFile: "./GoogleService-Info.plist",
    supportsTablet: true,
    bundleIdentifier: getUniqueIdentifier(),
    jsEngine: "hermes",
  },
  android: {
    googleServicesFile: "./google-services.json",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: getUniqueIdentifier(),
    jsEngine: "hermes",
  },
  developmentClient: {
    silentLaunch: true,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "@react-native-firebase/app",
    "@react-native-firebase/auth",
    "@react-native-firebase/crashlytics",
    [
      "expo-build-properties",
      {
        "ios": {
          "useFrameworks": "static"
        }
      }
    ],
    [
      "@rnmapbox/maps",
      {
        RNMapboxMapsDownloadToken:
          "sk.eyJ1IjoidGFrc2hha211ZGdhbCIsImEiOiJjbWFyNmMzNnkwMmF0MmxzMms3NjczdG5oIn0.cjRtcsNQ25-5c0vWTDG6rg",
        RNMapboxMapsVersion: "11.8.0", // Or your desired version, 11.x is recommended
      },
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Show current location on map for navigation.",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: "fdd3b266-be2b-4347-9598-c6373b304ac4",
    },
  },
  owner: "go-cabs",
});
