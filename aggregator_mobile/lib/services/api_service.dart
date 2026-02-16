import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/api_config.dart';

/// API service for Loan Aggregator backend.
class ApiService {
  ApiService({String? baseUrl})
      : _baseUrl = baseUrl ?? ApiConfig.baseUrl;

  final String _baseUrl;

  String get _apiUrl => '$_baseUrl${ApiConfig.apiPath}';

  Future<http.Response> get(String path) async {
    return http.get(Uri.parse('$_apiUrl$path'));
  }

  Future<http.Response> post(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    return http.post(
      Uri.parse('$_apiUrl$path'),
      headers: {'Content-Type': 'application/json'},
      body: body != null ? jsonEncode(body) : null,
    );
  }
}
