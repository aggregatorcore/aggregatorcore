import 'package:flutter/foundation.dart';

import '../services/auth_service.dart';

/// Auth state provider.
class AuthProvider extends ChangeNotifier {
  AuthProvider({AuthService? authService})
      : _authService = authService ?? AuthService();

  final AuthService _authService;

  bool get isLoggedIn => _authService.currentUser != null;
}
