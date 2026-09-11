const messages = {
  'auth/invalid_credentials': {
    fr: 'Email ou mot de passe incorrect.',
    en: 'Invalid email or password.',
    ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  },
  'auth/email_in_use': {
    fr: 'Cet email est déjà utilisé.',
    en: 'Email already in use.',
    ar: 'البريد الإلكتروني مستخدم بالفعل.',
  },
  'auth/user_not_found': {
    fr: 'Utilisateur introuvable.',
    en: 'User not found.',
    ar: 'المستخدم غير موجود.',
  },
  'auth/too_many_requests': {
    fr: 'Trop de tentatives. Veuillez réessayer plus tard.',
    en: 'Too many requests. Please try again later.',
    ar: 'عدد كبير جدًا من الطلبات. يرجى المحاولة مرة أخرى لاحقًا.',
  },
  'auth/weak_password': {
    fr: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
    en: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
    ar: 'يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل، حرف كبير، حرف صغير، رقم، وحرف خاص.',
  },
  'auth/invalid_token': {
    fr: 'Token invalide ou expiré.',
    en: 'Invalid or expired token.',
    ar: 'رمز غير صالح أو منتهي الصلاحية.',
  },
  'auth/refresh_token_expired': {
    fr: 'Le token de rafraîchissement a expiré.',
    en: 'Refresh token expired.',
    ar: 'انتهت صلاحية رمز التحديث.',
  },
  'auth/refresh_token_revoked': {
    fr: 'Le token de rafraîchissement a été révoqué.',
    en: 'Refresh token revoked.',
    ar: 'تم إلغاء رمز التحديث.',
  },
  'auth/refresh_token_reuse_detected': {
    fr: 'Tentative d’utilisation d’un token déjà utilisé - toutes les sessions ont été invalidées.',
    en: 'Refresh token reuse detected - all sessions invalidated.',
    ar: 'تم اكتشاف إعادة استخدام رمز التحديث - تم إلغاء جميع الجلسات.',
  },
  'auth/unauthorized': {
    fr: 'Non autorisé.',
    en: 'Unauthorized.',
    ar: 'غير مصرح.',
  },
  'auth/forbidden': {
    fr: 'Accès interdit.',
    en: 'Forbidden.',
    ar: 'ممنوع الوصول.',
  },
  'auth/missing_refresh_token': {
    fr: 'Token de rafraîchissement manquant.',
    en: 'Missing refresh token.',
    ar: 'رمز التحديث مفقود.',
  },
  'auth/missing_access_token': {
    en: "Access token is required",
    fr: "Token d'accès est requis",
    ar: "رمز الوصول مطلوب"
  },
  'auth/reset_email_sent': {
    en: 'If that email is registered, a reset link has been sent.',
    fr: 'Si cet email est enregistré, un lien de réinitialisation a été envoyé.',
    ar: 'إذا كان هذا البريد الإلكتروني مسجلاً، فقد تم إرسال رابط إعادة التعيين.',
  },
  'auth/password_reset_success': {
    en: 'Your password has been reset successfully.',
    fr: 'Votre mot de passe a été réinitialisé avec succès.',
    ar: 'تم إعادة تعيين كلمة المرور بنجاح.',
  },
  'auth/missing_reset_token': {
    en: 'Reset token is required.',
    fr: 'Le jeton de réinitialisation est requis.',
    ar: 'رمز إعادة التعيين مطلوب.',
  },
  'auth/too_many_attempts': {
    en: 'Too many attempts. Please request a new reset link.',
    fr: 'Trop de tentatives. Veuillez demander un nouveau lien.',
    ar: 'محاولات كثيرة جدًا. يرجى طلب رابط جديد.',
  },
  'auth/account_locked': {
    en: 'Your account is locked due to too many failed attempts. Please try again after 15 minutes.',
    fr: 'Votre compte est verrouillé en raison de trop de tentatives échouées. Veuillez réessayer dans 15 minutes.',
    ar: 'تم قفل حسابك بسبب كثرة المحاولات الفاشلة. يرجى المحاولة مرة أخرى بعد 15 دقيقة.',
  },
  'auth/2fa_required': {
    en: 'Two-factor authentication is required.',
    fr: 'L\'authentification à deux facteurs est requise.',
    ar: 'المصادقة ذات العاملين مطلوبة.',
  },
  'auth/2fa_invalid_code': {
    en: 'Invalid or expired 2FA code.',
    fr: 'Code 2FA invalide ou expiré.',
    ar: 'رمز المصادقة الثنائية غير صالح أو منتهي الصلاحية.',
  },
  'auth/2fa_too_many_attempts': {
    en: 'Too many 2FA attempts. Please request a new code.',
    fr: 'Trop de tentatives 2FA. Veuillez demander un nouveau code.',
    ar: 'محاولات كثيرة جداً للمصادقة الثنائية. يرجى طلب رمز جديد.',
  },
  'auth/2fa_request_limit': {
    en: 'Too many 2FA requests. Please wait an hour and try again.',
    fr: 'Trop de demandes 2FA. Veuillez patienter une heure.',
    ar: 'طلبات كثيرة للمصادقة الثنائية. يرجى الانتظار ساعة.',
  },
  'auth/invalid_password': {
    en: 'Invalid password.',
    fr: 'Mot de passe incorrect.',
    ar: 'كلمة المرور غير صحيحة.',
  },
  'auth/toggle_2fa_locked': {
    en: 'Too many failed password attempts. Please try again after 15 minutes.',
    fr: 'Trop de tentatives de mot de passe échouées. Veuillez réessayer après 15 minutes.',
    ar: 'محاولات كثيرة لكلمة المرور. يرجى المحاولة مرة أخرى بعد 15 دقيقة.',
  },
  'auth/otp_sent': {
    en: 'A new verification code has been sent to your email.',
    fr: 'Un nouveau code de vérification a été envoyé à votre email.',
    ar: 'تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني.',
  },
  'auth/2fa_not_available_for_google': {
    en: 'Two-factor authentication is only available for LOCAL accounts.',
    fr: 'L\'authentification à deux facteurs est uniquement disponible pour les comptes LOCAUX.',
    ar: 'المصادقة ذات العاملين متاحة فقط للحسابات المحلية.',
  },
  'auth/oauth_invalid_state': {
    en: 'Invalid OAuth session. Please try again.',
    fr: 'Session OAuth invalide. Veuillez réessayer.',
    ar: 'جلسة OAuth غير صالحة. يرجى المحاولة مرة أخرى.',
  },
  'auth/oauth_email_unverified': {
    en: 'Your Google email is not verified. Please verify your email and try again.',
    fr: 'Votre e-mail Google n\'est pas vérifié. Veuillez vérifier votre e-mail et réessayer.',
    ar: 'بريدك الإلكتروني في Google غير مُتحقق. يرجى التحقق من بريدك الإلكتروني والمحاولة مرة أخرى.',
  },
  'auth/oauth_email_registered_local': {
    en: 'This email is already registered with a password. Please log in using your password.',
    fr: 'Cet e-mail est déjà enregistré avec un mot de passe. Veuillez vous connecter avec votre mot de passe.',
    ar: 'هذا البريد الإلكتروني مسجل بالفعل بكلمة مرور. يرجى تسجيل الدخول باستخدام كلمة المرور الخاصة بك.',
  },
  'auth/oauth_not_allowed_for_role': {
    en: 'Google sign-in is not available for administrator accounts. Please sign in using your password.',
    fr: 'La connexion avec Google n’est pas disponible pour les comptes administrateur. Veuillez vous connecter avec votre mot de passe.',
    ar: 'تسجيل الدخول باستخدام Google غير متاح لحسابات المسؤولين. يرجى تسجيل الدخول باستخدام كلمة المرور الخاصة بك.',
  },
  'auth/2fa_admin_required': {
    en: 'Two-factor authentication is required for admin accounts and cannot be disabled.',
    fr: 'L\'authentification à deux facteurs est obligatoire pour les comptes administrateur et ne peut pas être désactivée.',
    ar: 'المصادقة ذات العاملين إلزامية لحسابات المدير ولا يمكن تعطيلها.',
  },

  'success/logged_out': {
    fr: 'Déconnecté avec succès.',
    en: 'Logged out successfully.',
    ar: 'تم تسجيل الخروج بنجاح.',
  },
  'success/logged_out_all': {
    fr: 'Déconnecté de tous les appareils.',
    en: 'Logged out from all devices.',
    ar: 'تم تسجيل الخروج من جميع الأجهزة.',
  },
  'success/2fa_toggled': {
    en: 'Two-factor authentication setting updated.',
    fr: 'Paramètre d\'authentification à deux facteurs mis à jour.',
    ar: 'تم تحديث إعداد المصادقة ذات العاملين.',
  },
  'success/sessions_revoked': {
    en: 'All active sessions have been revoked successfully.',
    fr: 'Toutes les sessions actives ont été révoquées avec succès.',
    ar: 'تم إلغاء جميع الجلسات النشطة بنجاح.',
  },
  'success/profile_updated': {
    en: 'Profile updated successfully.',
    fr: 'Profil mis à jour avec succès.',
    ar: 'تم تحديث الملف الشخصي بنجاح.',
  },

  'validation/password_length_invalid': {
    fr: 'Le mot de passe doit contenir entre 8 et 128 caractères.',
    en: 'Password must be between 8 and 128 characters.',
    ar: 'يجب أن تحتوي كلمة المرور على ما بين 8 و 128 حرفًا.',
  },
  'validation/first_name_length_invalid': {
    fr: 'Le prénom doit contenir entre 2 et 30 caractères.',
    en: 'First name must be between 2 and 30 characters.',
    ar: 'يجب أن يتكون الاسم من 2 إلى 30 حرفًا.',
  },
  'validation/last_name_length_invalid': {
    fr: 'Le nom doit contenir entre 2 et 30 caractères.',
    en: 'Last name must be between 2 and 30 characters.',
    ar: 'يجب أن يتكون اسم العائلة من 2 إلى 30 حرفًا.',
  },
  'validation/first_name_invalid_chars': { 
    fr: 'Le prénom contient des caractères invalides.', 
    en: 'First name contains invalid characters.', 
    ar: 'يحتوي الاسم على أحرف غير صالحة.', 
  }, 'validation/last_name_invalid_chars': { 
    fr: 'Le nom contient des caractères invalides.', 
    en: 'Last name contains invalid characters.', 
    ar: 'يحتوي اسم العائلة على أحرف غير صالحة.',
  },
  'validation/email_too_long': {
    fr: "L'adresse e-mail ne doit pas dépasser 254 caractères.",
    en: 'Email address must not exceed 254 characters.',
    ar: 'يجب ألا يتجاوز عنوان البريد الإلكتروني 254 حرفًا.',
  },
  'validation/invalid_first_name': {
    fr: "Le prénom contient des caractères non autorisés.",
    en: 'First name contains invalid characters.',
    ar: 'يحتوي الاسم على أحرف غير صالحة.',
  },
  'validation/invalid_last_name': {
    fr: 'Le nom contient des caractères non autorisés.',
    en: 'Last name contains invalid characters.',
    ar: 'يحتوي اسم العائلة على أحرف غير صالحة.',
  },
  'validation/invalid_email': {
    fr: 'Email invalide.',
    en: 'Invalid email.',
    ar: 'بريد إلكتروني غير صالح.',
  },
  'validation/required_field': {
    fr: 'Ce champ est requis.',
    en: 'This field is required.',
    ar: 'هذا الحقل مطلوب.',
  },
  'validation/password_weak': { 
    fr: 'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial.', 
    en: 'Password must contain uppercase, lowercase, number, and special character.', 
    ar: 'يجب أن تحتوي كلمة المرور على حرف كبير، حرف صغير، رقم وحرف خاص.' 
  },
  'validation/invalid_locale': { 
    fr: 'Locale non prise en charge.', 
    en: 'Unsupported locale.', 
    ar: 'لغة غير مدعومة.' 
  },
  'validation/invalid_year': {
    en: 'Please enter a valid year of birth.',
    fr: 'Veuillez entrer une année de naissance valide.',
    ar: 'يرجى إدخال سنة ميلاد صالحة.',
  },
  'validation/invalid_school_level': {
    en: 'Invalid school level. Must be MIDDLE_SCHOOL or HIGH_SCHOOL.',
    fr: 'Niveau scolaire invalide. Doit être MIDDLE_SCHOOL ou HIGH_SCHOOL.',
    ar: 'مستوى دراسي غير صالح. يجب أن يكون MIDDLE_SCHOOL أو HIGH_SCHOOL.',
  },
  'validation/invalid_degree': {
    en: 'Invalid degree type.',
    fr: 'Type de diplôme invalide.',
    ar: 'نوع الشهادة غير صالح.',
  },
  'validation/invalid_bac_year': {
    en: 'Please enter a valid baccalaureate year.',
    fr: 'Veuillez entrer une année de baccalauréat valide.',
    ar: 'يرجى إدخال سنة بكالوريا صالحة.',
  },
  'validation/invalid_grade': {
    en: 'Grade must be between 0 and 100.',
    fr: 'La note doit être comprise entre 0 et 100.',
    ar: 'يجب أن تكون النقطة بين 0 و 100.',
  },
  'validation/invalid_uuid_array': {
    en: 'Invalid format. Please provide an array of valid UUIDs.',
    fr: 'Format invalide. Veuillez fournir un tableau d\'UUID valides.',
    ar: 'تنسيق غير صالح. يرجى تقديم مصفوفة من المعرفات الصالحة.',
  },
  'validation/invalid_uuid': {
    en: 'Invalid UUID format.',
    fr: 'Format UUID invalide.',
    ar: 'تنسيق UUID غير صالح.',
  },
  'validation/no_fields_to_update': {
    en: 'No fields to update.',
    fr: 'Aucun champ à mettre à jour.',
    ar: 'لا توجد حقول للتحديث.',
  },
  'validation/invalid_number': {
    fr: 'Le nombre doit être compris entre 0 et 999.',
    en: 'The number must be between 0 and 999.',
    ar: 'يجب أن يكون الرقم بين 0 و 999.',
  },
  'validation/invalid_diploma_field': {
    fr: 'Le champ du diplôme est invalide.',
    en: 'Invalid diploma field.',
    ar: 'حقل الشهادة غير صالح.',
  },

  'internal_error': { 
    fr: 'Une erreur interne est survenue.', 
    en: 'Internal server error.', 
    ar: 'حدث خطأ داخلي.',
  },
};

function getMessage(key, locale = 'en') {
  const entry = messages[key];
  if (!entry) 
    return key;
  return entry[locale] || entry.en;
}

module.exports = { getMessage };