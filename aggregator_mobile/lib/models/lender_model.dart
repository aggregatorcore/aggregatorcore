/// Lender model.
class LenderModel {
  const LenderModel({
    required this.id,
    required this.name,
    this.isActive = true,
    this.minIncome,
    this.minLoan,
    this.maxLoan,
    this.supportedCities,
    this.employmentSupported,
    this.affiliateUrl,
    this.createdAt,
  });

  final String id;
  final String name;
  final bool isActive;
  final int? minIncome;
  final int? minLoan;
  final int? maxLoan;
  final List<String>? supportedCities;
  final List<String>? employmentSupported;
  final String? affiliateUrl;
  final DateTime? createdAt;

  factory LenderModel.fromJson(Map<String, dynamic> json) {
    return LenderModel(
      id: json['id'] as String,
      name: json['name'] as String,
      isActive: json['is_active'] as bool? ?? true,
      minIncome: json['min_income'] as int?,
      minLoan: json['min_loan'] as int?,
      maxLoan: json['max_loan'] as int?,
      supportedCities: (json['supported_cities'] as List<dynamic>?)
          ?.map((e) => e.toString())
          .toList(),
      employmentSupported:
          (json['employment_supported'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList(),
      affiliateUrl: json['affiliate_url'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
          : null,
    );
  }
}
