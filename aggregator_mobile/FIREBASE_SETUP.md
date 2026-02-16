# Firebase Setup

## Android

1. **Firebase Console** → Project → Project Settings → Your Apps
2. If Android not added: **Add App** → **Android**
3. **Package name:** `com.aggregator.mobile`
4. Download **google-services.json**
5. Place at: `android/app/google-services.json`

## iOS

1. **Add App** → **iOS**
2. **Bundle ID:** `com.aggregator.mobile`
3. Download **GoogleService-Info.plist**
4. Place at: `ios/Runner/GoogleService-Info.plist`

## Build files (already updated)

- `android/settings.gradle.kts` – Google Services plugin added
- `android/app/build.gradle.kts` – Plugin applied, applicationId = com.aggregator.mobile
