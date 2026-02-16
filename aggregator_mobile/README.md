# Loan Aggregator Mobile

Flutter mobile app for Loan Aggregator.

## Setup

1. **Flutter** – Ensure Flutter is installed (`flutter doctor`)
2. **Firebase** – Run `flutterfire configure` to link Firebase project
3. **Dependencies** – `flutter pub get`

## Run

```bash
flutter run
```

## Structure

```
lib/
  main.dart
  app_router.dart
  config/
    api_config.dart      # Base URL: https://aggregatorcore.onrender.com
  services/
    auth_service.dart
    api_service.dart
  providers/
    auth_provider.dart
  screens/
    splash_screen.dart
    login_screen.dart
    profile_screen.dart
    loan_screen.dart
    lenders_screen.dart
  models/
    user_model.dart
    lender_model.dart
```

## Routes

- `/splash` – Splash
- `/login` – Login
- `/profile` – Profile
- `/loan` – Loan
- `/lenders` – Lenders
