/// User model.
class UserModel {
  const UserModel({
    required this.id,
    this.firebaseUid,
    this.mobileNumber,
    this.createdAt,
  });

  final String id;
  final String? firebaseUid;
  final String? mobileNumber;
  final DateTime? createdAt;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      firebaseUid: json['firebase_uid'] as String?,
      mobileNumber: json['mobile_number'] as String?,
      createdAt: json['created_at'] != null
          ? DateTime.tryParse(json['created_at'] as String)
          : null,
    );
  }
}
