const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

const isTest = process.env.NODE_ENV === 'test';

const theme = {
  bg: '#f8f9fa',
  cardBg: '#ffffff',
  cardBorder: '1px solid #e9ecef',
  cardRadius: '8px',
  cardShadow: '0 2px 8px rgba(0,0,0,0.04)',
  headerBg: '#ffffff',
  headerBorder: '1px solid #e9ecef',
  headerText: '#212529',
  bodyText: '#212529',
  muted: '#6c757d',
  buttonBg: '#007bff',
  buttonText: '#ffffff',
  buttonBorder: 'none',
  buttonShadow: 'none',
  buttonRadius: '6px',
  fontDisplay: "'Inter', Arial, sans-serif",
  fontBody: "'Inter', Arial, sans-serif",
  linkColor: '#007bff',
};

const ASSETS_BASE_URL = process.env.ASSETS_BASE_URL || process.env.BACKEND_URL || '';

const ICONS = {
  key: `${ASSETS_BASE_URL}/key.png`,
  recycle: `${ASSETS_BASE_URL}/recycle.png`,
  defense: `${ASSETS_BASE_URL}/defense.png`,
  info: `${ASSETS_BASE_URL}/info.png`,
};

function ctaButton({ href, label, bg }) {
  return `
    <a href="${href}" style="background-color:${bg || theme.buttonBg};font-family:${theme.fontDisplay};font-weight:900;font-size:15px;letter-spacing:0.5px;color:${theme.buttonText};text-decoration:none;text-transform:uppercase;display:block;padding: 18px 42px;border-radius: 50px;width:fit-content;margin:0 auto;">
      ${label}
    </a>
    `;
}

function renderShell({ locale, icon, kicker, title, bodyHtml }) {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const iconAlign = dir === 'rtl' ? 'left' : 'right';

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;900&family=Merriweather:wght@900&family=Nunito:wght@400;900&family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:${theme.bg};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${theme.bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!-- Card container -->
        <table role="presentation" cellpadding="0" cellspacing="0" style="background-color:${theme.bg};max-width:1028px;width:100%;">
          <tr>
            <td style="padding:0 8px 8px 0;">

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${theme.cardBg};border-radius:${theme.cardRadius};border:${theme.cardBorder};box-shadow:${theme.cardShadow};">

                <!-- Header -->
                <tr>
                  <td style="background-color:${theme.headerBg};border-bottom:${theme.headerBorder};border-radius:${theme.cardRadius} ${theme.cardRadius} 0 0;padding:32px 32px 24px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align:top;">
                          <div style="font-family:${theme.fontDisplay};font-size:13px;font-weight:900;letter-spacing:3px;color:${theme.headerText};margin:0 0 12px;">KHARITA</div>
                          <div style="font-family:${theme.fontDisplay};font-size:28px;line-height:1.08;font-weight:900;letter-spacing:-0.5px;color:${theme.headerText};text-transform:uppercase;margin:0 0 10px;">${title}</div>
                          <div style="font-family:${theme.fontBody};font-size:11px;font-weight:bold;letter-spacing:2px;color:${theme.headerText};text-transform:uppercase;">${kicker}</div>
                        </td>
                        <td  width="40" style="vertical-align:center;text-align:${iconAlign};">
                          <img src="${icon}" width="40" alt="icon" style="display:block;border:0;outline:none;text-decoration:none;">
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:32px; text-align:center;">
                    ${bodyHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

function textBlock(text, color) {
  return `<p style="font-family:${theme.fontBody};font-size:14px;line-height:1.6;color:${color || theme.bodyText};margin:0 0 14px;">${text}</p>`;
}

function labelValue(label, value) {
  return `
    <p style="font-family:${theme.fontBody};font-size:13px;color:${theme.muted};margin:0 0 4px;">${label}</p>
    <p style="font-family:${theme.fontDisplay};font-size:15px;font-weight:900;color:${theme.bodyText};margin:0 0 20px;word-break:break-all;">${value}</p>`;
}

// ---- Test logger ----
function logTestEmail({ to, subject, resetLink, otp, revokeUrl }) {
  console.log(`📧 [TEST] Would send email to ${to}`);
  console.log('  Subject:', subject);
  if (resetLink) console.log('  Reset Link:', resetLink);
  if (otp) console.log('  OTP:', otp);
  if (revokeUrl) console.log('  Revoke URL:', revokeUrl);
  console.log('---');
}

async function sendViaResend(payload, context) {
  const { data, error } = await resend.emails.send(payload);
  if (error) {
    console.error(`Resend error (${context}):`, error);
    throw new Error(`Failed to send ${context}: ${error.message}`);
  }
  return data;
}

async function sendResetEmail({ to, resetLink, locale }) {
  if (isTest) {
    logTestEmail({ to, subject: 'Reset Your Password', resetLink, locale });
    return;
  }

  const content = {
    en: {
      subject: 'Reset Your Password',
      title: 'Reset Access',
      kicker: 'Protocol // Password Recovery',
      addrLabel: 'Recovery requested for',
      intro: 'We received a request to reset the password for your account.',
      button: 'Reset Password',
      expires: 'This link will expire in 30 minutes.',
      ignore: "If you didn't request a password reset, you can safely ignore this email.",
      footer: 'For security reasons, do not share this link with anyone.',
      linkFallback: 'Button not working? Copy and paste this link:',
      backToLogin: 'Back to Login',
    },
    fr: {
      subject: 'Réinitialisez votre mot de passe',
      title: "Réinitialiser l'accès",
      kicker: 'Protocole // Récupération',
      addrLabel: 'Récupération demandée pour',
      intro: 'Nous avons reçu une demande de réinitialisation du mot de passe de votre compte.',
      button: 'Réinitialiser',
      expires: 'Ce lien expirera dans 30 minutes.',
      ignore: "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.",
      footer: 'Pour votre sécurité, ne partagez ce lien avec personne.',
      linkFallback: 'Le bouton ne fonctionne pas ? Copiez-collez ce lien :',
      backToLogin: 'Retour à la connexion',
    },
    ar: {
      subject: 'إعادة تعيين كلمة المرور',
      title: 'إعادة ضبط الوصول',
      kicker: 'بروتوكول // استعادة كلمة المرور',
      addrLabel: 'طلب الاستعادة لـ',
      intro: 'لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك.',
      button: 'إعادة تعيين كلمة المرور',
      expires: 'ستنتهي صلاحية هذا الرابط خلال 30 دقيقة.',
      ignore: 'إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة.',
      footer: 'لأسباب أمنية، لا تشارك هذا الرابط مع أي شخص.',
      linkFallback: 'الزر لا يعمل؟ انسخ والصق هذا الرابط:',
      backToLogin: 'العودة إلى تسجيل الدخول',
    },
  };

  const c = content[locale] || content.en;

  const bodyHtml = `
    ${labelValue(c.addrLabel, to)}
    ${textBlock(c.intro)}
    <div style="margin:24px auto;">${ctaButton({ href: resetLink, label: c.button })}</div>
    ${textBlock(c.expires, theme.muted)}
    ${textBlock(c.ignore, theme.muted)}
    <hr style="border:none;border-top:1px solid ${theme.muted}40;margin:24px 0;">
    <p style="font-family:${theme.fontBody};font-size:12px;color:${theme.muted};margin:0 0 4px;">${c.linkFallback}</p>
    <p style="font-family:${theme.fontBody};font-size:12px;color:${theme.muted};word-break:break-all;margin:0;">${resetLink}</p>
  `;

  const html = renderShell({
    locale,
    icon: ICONS.recycle,
    kicker: c.kicker,
    title: c.title,
    bodyHtml
  });

  return sendViaResend({
    from: process.env.MAIL_FROM,
    to,
    subject: c.subject,
    text: `${c.intro}\n\n${resetLink}\n\n${c.expires}\n\n${c.ignore}\n\n${c.footer}`.trim(),
    html,
  }, 'sendResetEmail');
}

async function sendOTPEmail({ to, otp, locale, pendingToken }) {
  const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
  const revokeUrl = `${frontendBase}/2fa-revoke?token=${pendingToken}`;

  if (isTest) {
    logTestEmail({ to, subject: 'Your login verification code', otp, revokeUrl, locale });
    return;
  }

  const content = {
    en: {
      subject: 'Your login verification code',
      title: 'Verify Identity',
      kicker: 'Protocol // Authentication',
      addrLabel: 'Enter the verification code sent to',
      codeLabel: 'Your code',
      expiry: 'This code expires in 5 minutes.',
      ignore: 'If you did not attempt to log in, please ignore this email.',
      revoke: "This wasn't me - secure my account now",
      footer: 'For your security, do not share this code with anyone.',
    },
    fr: {
      subject: 'Votre code de vérification de connexion',
      title: "Vérifier l'identité",
      kicker: 'Protocole // Authentification',
      addrLabel: 'Entrez le code envoyé à',
      codeLabel: 'Votre code',
      expiry: 'Ce code expire dans 5 minutes.',
      ignore: "Si vous n'avez pas tenté de vous connecter, ignorez cet e-mail.",
      revoke: "Ce n'était pas moi - sécuriser mon compte maintenant",
      footer: 'Pour votre sécurité, ne partagez ce code avec personne.',
    },
    ar: {
      subject: 'رمز التحقق لتسجيل الدخول',
      title: 'تحقق من الهوية',
      kicker: 'بروتوكول // المصادقة',
      addrLabel: 'أدخل الرمز المرسل إلى',
      codeLabel: 'رمزك',
      expiry: 'تنتهي صلاحية هذا الرمز خلال 5 دقائق.',
      ignore: 'إذا لم تحاول تسجيل الدخول، فيرجى تجاهل هذا البريد الإلكتروني.',
      revoke: 'لست أنا - قم بتأمين حسابي الآن',
      footer: 'لأسباب أمنية، لا تشارك هذا الرمز مع أي شخص.',
    },
  };

  const c = content[locale] || content.en;

  const digits = String(otp).split('');
  const otpCells = digits
    .map(
      (d) => `${d}`
    )
    .join('');
  const otpBoxes = `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px auto 24px;"><tr><td style="width:42px;height:50px;border:2px solid ${theme.bodyText};background:${theme.cardBg};text-align:center;vertical-align:middle;border-radius:6px;">
          <span style="font-family:${theme.fontDisplay};font-weight:900;font-size:22px;color:${theme.bodyText};color: #212529;
    padding: 10px 20px;">${otpCells}</span>
        </td>
        <td style="width:8px;"></td></tr></table>`;

  const bodyHtml = `
    <p style="font-family:${theme.fontBody};font-size:13px;color:${theme.muted};margin:0 0 4px;">${c.addrLabel}</p>
    <p style="font-family:${theme.fontDisplay};font-size:15px;font-weight:900;color:${theme.bodyText};margin:0 0 4px;word-break:break-all;">${to}</p>
    <p style="font-family:${theme.fontBody};font-size:12px;color:${theme.muted};margin:0 0 20px;">${c.expiry}</p>

    ${otpBoxes}

    ${textBlock(c.ignore, theme.muted)}
    <p style="margin:20px 0 0;">
      <a href="${revokeUrl}" style="font-family:${theme.fontBody};font-size:13px;font-weight:bold;color:#e7000b;text-decoration:underline;">${c.revoke}</a>
    </p>
  `;

  const html = renderShell({
    locale,
    icon: ICONS.key,
    kicker: c.kicker,
    title: c.title,
    bodyHtml,
  });

  return sendViaResend({
    from: process.env.MAIL_FROM,
    to,
    subject: c.subject,
    text: `${c.codeLabel}: ${otp}\n\n${c.expiry}\n\n${c.ignore}\n\n${c.revoke}\n${revokeUrl}\n\n${c.footer}`.trim(),
    html,
  }, 'sendOTPEmail');
}

async function sendLockoutAlertEmail({ to, locale }) {
  if (isTest) {
    logTestEmail({ to, subject: 'Account locked due to failed login attempts', locale });
    return;
  }

  const frontendBase = process.env.FRONTEND_URL;
  const forgotPasswordUrl = `${frontendBase}/forgot-password`;

  const content = {
    en: {
      subject: 'Account locked due to failed login attempts',
      title: 'Account Locked',
      kicker: 'Security // Access Suspended',
      intro: 'Your account has been temporarily locked for 15 minutes due to too many failed login attempts.',
      action: 'You have two options: wait 15 minutes and try again, or reset your password immediately to unlock your account.',
      resetButton: 'Reset Password',
      linkFallback: 'Button not working? Copy and paste this link:',
      footer: 'If this was not you, please contact support.',
      contact: 'Contact Support',
    },
    fr: {
      subject: 'Compte verrouillé en raison de plusieurs tentatives de connexion échouées',
      title: 'Compte verrouillé',
      kicker: 'Sécurité // Accès suspendu',
      intro: "Votre compte a été temporairement verrouillé pendant 15 minutes en raison d'un trop grand nombre de tentatives de connexion échouées.",
      action: "Deux options s'offrent à vous : patientez 15 minutes puis réessayez, ou réinitialisez immédiatement votre mot de passe pour déverrouiller votre compte.",
      resetButton: 'Réinitialiser le mot de passe',
      linkFallback: 'Le bouton ne fonctionne pas ? Copiez-collez ce lien :',
      footer: "Si vous n'êtes pas à l'origine de cette activité, veuillez contacter le support.",
      contact: 'Contacter le support',
    },
    ar: {
      subject: 'تم قفل الحساب بسبب محاولات تسجيل دخول فاشلة',
      title: 'تم قفل الحساب',
      kicker: 'الأمان // تم تعليق الوصول',
      intro: 'تم قفل حسابك مؤقتًا لمدة 15 دقيقة بسبب كثرة محاولات تسجيل الدخول الفاشلة.',
      action: 'لديك خياران: انتظر 15 دقيقة ثم أعد المحاولة، أو أعد تعيين كلمة المرور فورًا لإلغاء قفل حسابك.',
      resetButton: 'إعادة تعيين كلمة المرور',
      linkFallback: 'الزر لا يعمل؟ انسخ والصق هذا الرابط:',
      footer: 'إذا لم تكن أنت من قام بهذه المحاولات، فيرجى التواصل مع فريق الدعم.',
      contact: 'تواصل مع الدعم',
    },
  };

  const c = content[locale] || content.en;

  const bodyHtml = `
    ${textBlock(c.intro)}
    ${textBlock(c.action, theme.muted)}
    <div style="margin:24px auto;">${ctaButton({ href: forgotPasswordUrl, label: c.resetButton })}</div>
    <hr style="border:none;border-top:1px solid ${theme.muted}40;margin:24px 0;">
    <p style="font-family:${theme.fontBody};font-size:12px;color:${theme.muted};margin:0 0 4px;text-align:center;">
      ${c.linkFallback}
    </p>
    <p style="font-family:${theme.fontBody};font-size:12px;color:${theme.muted};word-break:break-all;margin:0;text-align:center;">
      ${forgotPasswordUrl}
    </p>
    <p style="font-family:${theme.fontBody};font-size:12px;color:${theme.muted};margin:16px 0 0;text-align:center;">
      ${c.footer}
    </p>
  `;

  const html = renderShell({
    locale,
    icon: ICONS.defense,
    kicker: c.kicker,
    title: c.title,
    bodyHtml,
  });

  return sendViaResend({
    from: process.env.MAIL_FROM,
    to,
    subject: c.subject,
    text: `${c.intro}\n\n${c.action}\n\n${c.resetButton}: ${forgotPasswordUrl}\n\n${c.footer}`.trim(),
    html,
  }, 'sendLockoutAlertEmail');
}

async function sendNewDeviceAlertEmail({ to, deviceName, locale, revokeToken, ip, location, authProvider }) {
  const frontendBase = process.env.FRONTEND_URL;
  const revokeUrl = `${frontendBase}/2fa-revoke?token=${revokeToken}&locale=${locale}`;

  if (isTest) {
    logTestEmail({ to, subject: 'New device login detected', revokeUrl, locale });
    return;
  }

  const isGoogle = authProvider === 'GOOGLE';

  const content = {
    en: {
      subject: 'New device login detected',
      title: 'New Device Login',
      kicker: 'Security // New Device',
      intro: `A new device "${deviceName}" has logged into your account.`,
      location: `Location: ${location || 'Unknown'}`,
      ipInfo: `IP Address: ${ip || 'Unknown'}`,
      action: 'If this was you, no further action is needed.',
      warning: isGoogle
        ? 'If this was not you, click the button below to revoke all sessions and review your Google account security settings.'
        : 'If this was not you, change your password immediately and revoke all sessions from your profile.',
      button: "This wasn't me - Secure my account",
      footer: 'For your security, do not share this email with anyone.',
    },
    fr: {
      subject: 'Nouvelle connexion détectée depuis un appareil',
      title: 'Nouvel appareil connecté',
      kicker: 'Sécurité // Nouvel appareil',
      intro: `Un nouvel appareil "${deviceName}" s'est connecté à votre compte.`,
      location: `Localisation : ${location || 'Inconnue'}`,
      ipInfo: `Adresse IP : ${ip || 'Inconnue'}`,
      action: "Si c'était vous, aucune action n'est nécessaire.",
      warning: isGoogle
        ? "Si ce n'était pas vous, cliquez sur le bouton ci-dessous pour révoquer toutes les sessions et vérifiez les paramètres de sécurité de votre compte Google."
        : "Si ce n'était pas vous, changez immédiatement votre mot de passe et révoquez toutes les sessions depuis votre profil.",
      button: "Ce n'était pas moi - Sécuriser mon compte",
      footer: 'Pour votre sécurité, ne partagez cet email avec personne.',
    },
    ar: {
      subject: 'تم اكتشاف تسجيل دخول من جهاز جديد',
      title: 'جهاز جديد سجّل الدخول',
      kicker: 'الأمان // جهاز جديد',
      intro: `قام جهاز جديد "${deviceName}" بتسجيل الدخول إلى حسابك.`,
      location: `الموقع: ${location || 'غير معروف'}`,
      ipInfo: `عنوان IP: ${ip || 'غير معروف'}`,
      action: 'إذا كنت أنت من قام بذلك، لا حاجة لاتخاذ أي إجراء.',
      warning: isGoogle
        ? 'إذا لم تكن أنت، فانقر على الزر أدناه لإلغاء جميع الجلسات ومراجعة إعدادات أمان حسابك على Google.'
        : 'إذا لم تكن أنت، فغيّر كلمة المرور الخاصة بك فورًا وألغِ جميع الجلسات من ملفك الشخصي.',
      button: 'لست أنا - قم بتأمين حسابي',
      footer: 'لأسباب أمنية، لا تشارك هذا البريد الإلكتروني مع أي شخص.',
    },
  };

  const c = content[locale] || content.en;

  const deviceInfo = `
    <table role="presentation" cellpadding="0" cellspacing="0" style="background:${theme.bg};border:1px solid ${theme.muted}40;border-radius:8px;margin:0 auto 20px;padding:14px 16px;width:auto;">
      <tr>
        <td>
          <p style="font-family:${theme.fontBody};font-size:13px;color:${theme.bodyText};margin:0 0 6px;">${c.location}</p>
          <p style="font-family:${theme.fontBody};font-size:13px;color:${theme.bodyText};margin:0;">${c.ipInfo}</p>
        </td>
      </tr>
    </table>`;

  const bodyHtml = `
    ${textBlock(c.intro)}
    ${deviceInfo}
    ${textBlock(c.action, theme.muted)}
    ${textBlock(c.warning, '#e7000b')}
    <div style="margin:24px auto;">${ctaButton({ href: revokeUrl, label: c.button, bg:"#e7000b" })}</div>
  `;

  const html = renderShell({
    locale,
    icon: ICONS.info,
    kicker: c.kicker,
    title: c.title,
    bodyHtml
  });

  return sendViaResend({
    from: process.env.MAIL_FROM,
    to,
    subject: c.subject,
    text: `${c.intro}\n\n${c.location}\n${c.ipInfo}\n\n${c.action}\n\n${c.warning}\n${revokeUrl}\n\n${c.footer}`.trim(),
    html,
  }, 'sendNewDeviceAlertEmail');
}

module.exports = { sendResetEmail, sendOTPEmail, sendLockoutAlertEmail, sendNewDeviceAlertEmail };