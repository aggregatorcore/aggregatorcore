# Codemagic Setup for Aggregator Mobile

Use Codemagic to build and distribute **iOS** (and optionally Android) apps from Windows without a Mac.

---

## 1. Prerequisites

- [Codemagic account](https://codemagic.io/signup) (free tier available)
- [Apple Developer account](https://developer.apple.com) ($99/year)
- Git repo with `aggregator_mobile` pushed (GitHub, GitLab, or Bitbucket)

---

## 2. Add App to Codemagic

1. Go to [codemagic.io](https://codemagic.io) and sign in
2. **Add application** → connect your Git provider (GitHub/GitLab/Bitbucket)
3. Select the `aggregatorcore` repository
4. Codemagic will detect Flutter projects. Your app is in **`aggregator_mobile`**
5. In **App settings → Build → Project path**, select or enter: **`aggregator_mobile`**

---

## 3. Build Platforms

| Platform | Build machine | Notes |
|----------|---------------|-------|
| **iOS**  | macOS only    | Requires code signing for release |
| **Android** | macOS, Linux, or Windows | Can run in same workflow as iOS on macOS |

For iOS-only builds, select **iOS** under **Build for platforms**.

---

## 4. iOS Code Signing

### Option A: Automatic (recommended)

1. In **App Store Connect** → **Users and Access** → **Integrations** → **App Store Connect API**
2. Create an API key with **App Manager** access
3. Download the `.p8` private key and note **Issuer ID** and **Key ID**
4. In Codemagic → **Team settings** → **Integrations** → **Apple Developer Portal**
5. Add the integration with:
   - Issuer ID
   - Key ID
   - API key (.p8 file)
6. In your workflow → **Code signing** → enable **Automatic code signing**
7. Set **Bundle ID**: `com.aggregator.mobile` (must match `ios/Runner.xcodeproj`)

### Option B: Manual

Upload your own:
- Distribution certificate (`.p12`)
- Provisioning profile (`.mobileprovision`)

---

## 5. Firebase / Google Services (iOS)

Your app uses Firebase. Codemagic needs `GoogleService-Info.plist` for iOS:

1. Add `GoogleService-Info.plist` to `aggregator_mobile/ios/Runner/`
2. Either:
   - **Commit it** to the repo (if not sensitive), or
   - Add it as a **secure file** in Codemagic and copy it in a pre-build script

---

## 6. Environment Variables (optional)

If your app needs API keys or backend URLs:

- **Codemagic** → **App settings** → **Environment variables**
- Add variables (e.g. `API_BASE_URL`, `FIREBASE_API_KEY`)
- Mark sensitive ones as **Secure**

---

## 7. Workflow Configuration

### Build section

- **Flutter version**: Stable (or match your `pubspec.yaml`)
- **Xcode version**: Latest stable (e.g. 15.x)
- **CocoaPods**: Default
- **Build mode**: Release (for App Store) or Debug (for testing)
- **Build arguments**: e.g. `--build-name=1.0.0 --build-number=1`

### Artifacts

- iOS: `.ipa` file (downloadable or publish to App Store Connect)
- Android: `.apk` or `.aab` (for Play Store)

---

## 8. Using codemagic.yaml (optional)

For version-controlled config, add `codemagic.yaml` at the **repository root** (`aggregatorcore/`):

```yaml
workflows:
  aggregator-mobile-ios:
    name: Aggregator Mobile iOS
    max_build_duration: 60
    environment:
      flutter: stable
      xcode: latest
      cocoapods: default
    scripts:
      - name: Get Flutter packages
        script: |
          cd aggregator_mobile
          flutter pub get
    artifacts:
      - aggregator_mobile/build/ios/ipa/*.ipa
    publishing:
      app_store_connect:
        api_key: $APP_STORE_CONNECT_KEY_ID
        key_id: $APP_STORE_CONNECT_KEY_ID
        issuer_id: $APP_STORE_CONNECT_ISSUER_ID
        submit_to_testflight: true
    actions:
      - name: Build iOS
        script: |
          cd aggregator_mobile
          flutter build ipa
```

Then configure code signing and App Store Connect credentials in Codemagic UI.

---

## 9. Triggering Builds

- **Manual**: Start new build → choose branch and workflow
- **Automatic**: Enable triggers for push/PR to `main` (or your default branch)

---

## 10. Useful Links

- [Codemagic Flutter docs](https://docs.codemagic.io/flutter-configuration/flutter-projects)
- [iOS code signing](https://docs.codemagic.io/flutter-code-signing/ios-code-signing)
- [Build without Mac (blog)](https://blog.codemagic.io/how-to-build-and-distribute-ios-apps-without-mac-with-flutter-codemagic)

---

## Quick Checklist

- [ ] Codemagic account created
- [ ] Repo connected
- [ ] Project path set to `aggregator_mobile`
- [ ] iOS build platform selected
- [ ] Apple Developer integration (or manual signing) configured
- [ ] `GoogleService-Info.plist` available for iOS
- [ ] First build triggered
