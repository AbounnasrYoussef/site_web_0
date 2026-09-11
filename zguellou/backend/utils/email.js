const nodemailer = require('nodemailer');

const isTest = process.env.NODE_ENV === 'test';

const transporter = isTest
  ? null
  : nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
      port: parseInt(process.env.MAIL_PORT) || 2525,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

function logTestEmail({ to, subject, text, html, resetLink, otp, revokeUrl }) {
  console.log(`📧 [TEST] Would send email to ${to}`);
  console.log('  Subject:', subject);
  if (resetLink) 
    console.log('  Reset Link:', resetLink);
  if (otp) 
    console.log('  OTP:', otp);
  if (revokeUrl) 
    console.log('  Revoke URL:', revokeUrl);
  console.log('---');
}

async function sendResetEmail({ to, resetLink, locale }) {
  if (isTest) {
    logTestEmail({ to, subject: 'Reset Your Password', resetLink, locale });
    return;
  }
  const content = {
    en: {
      subject: 'Reset Your Password',
      greeting: 'Password Reset Request',
      intro: 'We received a request to reset the password for your account.',
      button: 'Reset Password',
      expires: 'This link will expire in 30 minutes.',
      ignore:
        "If you didn't request a password reset, you can safely ignore this email.",
      footer: 'For security reasons, do not share this link with anyone.',
    },
    fr: {
      subject: 'Réinitialisez votre mot de passe',
      greeting: 'Demande de réinitialisation du mot de passe',
      intro:
        'Nous avons reçu une demande de réinitialisation du mot de passe de votre compte.',
      button: 'Réinitialiser le mot de passe',
      expires: 'Ce lien expirera dans 30 minutes.',
      ignore:
        "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.",
      footer: 'Pour votre sécurité, ne partagez ce lien avec personne.',
    },
    ar: {
      subject: 'إعادة تعيين كلمة المرور',
      greeting: 'طلب إعادة تعيين كلمة المرور',
      intro: 'لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك.',
      button: 'إعادة تعيين كلمة المرور',
      expires: 'ستنتهي صلاحية هذا الرابط خلال 30 دقيقة.',
      ignore: 'إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة.',
      footer: 'لأسباب أمنية، لا تشارك هذا الرابط مع أي شخص.',
    },
  };

  const c = content[locale] || content.en;

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'Kharita <no-reply@kharita.com>',
    to,
    subject: c.subject,

    text: `
${c.greeting}

${c.intro}

${resetLink}

${c.expires}

${c.ignore}

${c.footer}
    `.trim(),

    html: `
      <!DOCTYPE html>
      <html lang="${locale}">
      <head>
      <meta charset="UTF-8">
      </head>
      <body style="margin:0;padding:40px;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
        <table width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center">
              <table width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;padding:40px;box-shadow:0 4px 20px rgba(0,0,0,.08);">

                <tr>
                  <td align="center">
                    <div style="font-size:48px;">🔒</div>
                    <h1 style="margin:16px 0 8px;color:#222;">${c.greeting}</h1>
                    <p style="margin:0;color:#666;font-size:16px;line-height:1.6;">
                      ${c.intro}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td align="center" style="padding:36px 0;">
                    <a
                      href="${resetLink}"
                      style="
                        display:inline-block;
                        background:#2563eb;
                        color:#ffffff;
                        text-decoration:none;
                        padding:14px 28px;
                        border-radius:8px;
                        font-weight:bold;
                        font-size:16px;
                      "
                    >
                      ${c.button}
                    </a>
                  </td>
                </tr>

                <tr>
                  <td>
                    <p style="margin:0 0 12px;color:#444;">
                      ${c.expires}
                    </p>

                    <p style="margin:0 0 12px;color:#666;">
                      ${c.ignore}
                    </p>

                    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">

                    <p style="font-size:12px;color:#999;word-break:break-all;">
                      ${resetLink}
                    </p>

                    <p style="font-size:12px;color:#999;margin-top:24px;">
                      ${c.footer}
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
}

async function sendOTPEmail({ to, otp, locale, pendingToken }) {
  if (isTest) {
    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const revokeUrl = `${frontendBase}/2fa-revoke?token=${pendingToken}`;
    logTestEmail({ to, subject: 'Your login verification code', otp, revokeUrl, locale });
    return;
  }
  const frontendBase = process.env.FRONTEND_URL;

  const content = {
    en: {
      subject: 'Your login verification code',
      greeting: '2FA Verification Code',
      intro: 'Use the following code to complete your login:',
      codeLabel: 'Your code:',
      expiry: 'This code expires in 5 minutes.',
      ignore: 'If you did not attempt to log in, please ignore this email.',
      revoke: "This wasn't me - secure my account now",
      footer: 'For your security, do not share this code with anyone.',
    },
    fr: {
      subject: 'Votre code de vérification de connexion',
      greeting: 'Code de vérification 2FA',
      intro: 'Utilisez le code suivant pour terminer votre connexion :',
      codeLabel: 'Votre code :',
      expiry: 'Ce code expire dans 5 minutes.',
      ignore: "Si vous n'avez pas tenté de vous connecter, ignorez cet e-mail.",
      revoke: "Ce n'était pas moi - sécuriser mon compte maintenant",
      footer: 'Pour votre sécurité, ne partagez ce code avec personne.',
    },
    ar: {
      subject: 'رمز التحقق لتسجيل الدخول',
      greeting: 'رمز التحقق بخطوتين',
      intro: 'استخدم الرمز التالي لإكمال تسجيل الدخول:',
      codeLabel: 'رمزك:',
      expiry: 'تنتهي صلاحية هذا الرمز خلال 5 دقائق.',
      ignore: 'إذا لم تحاول تسجيل الدخول، فيرجى تجاهل هذا البريد الإلكتروني.',
      revoke: 'لست أنا - قم بتأمين حسابي الآن',
      footer: 'لأسباب أمنية، لا تشارك هذا الرمز مع أي شخص.',
    },
  };

  const c = content[locale] || content.en;
  const revokeUrl = `${frontendBase}/2fa-revoke?token=${pendingToken}`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'Kharita <no-reply@kharita.com>',
    to,
    subject: c.subject,
    text: `
${c.greeting}

${c.intro}

${c.codeLabel} ${otp}

${c.expiry}

${c.ignore}

${c.revoke}
${revokeUrl}

${c.footer}
    `.trim(),
    html: `
      <!DOCTYPE html>
      <html lang="${locale}" dir="${locale === 'ar' ? 'rtl' : 'ltr'}">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${c.greeting}</h2>
        <p>${c.intro}</p>

        <div style="font-size:28px;font-weight:bold;background:#f4f4f5;padding:12px 24px;display:inline-block;border-radius:6px;margin:16px 0;">
          ${otp}
        </div>

        <p>${c.expiry}</p>
        <p>${c.ignore}</p>

        <p style="margin-top:24px;">
          <a href="${revokeUrl}" style="color:#dc2626;font-weight:bold;">
            ${c.revoke}
          </a>
        </p>

        <hr>
        <p style="font-size:12px;color:#777;">${c.footer}</p>
      </body>
      </html>
    `,
  });
}

async function sendLockoutAlertEmail({ to, locale }) {
  if (isTest) {
    logTestEmail({ to, subject: 'Account locked due to failed login attempts', locale });
    return;
  }
  const content = {
    en: {
      subject: 'Account locked due to failed login attempts',
      greeting: 'Account Locked',
      intro: 'Your account has been temporarily locked for 15 minutes due to too many failed login attempts.',
      action: 'You can try again after 15 minutes, or reset your password if you have forgotten it.',
      footer: 'If this was not you, please contact support.',
    },
    fr: {
      subject: "Compte verrouillé en raison de plusieurs tentatives de connexion échouées",
      greeting: "Compte verrouillé",
      intro: "Votre compte a été temporairement verrouillé pendant 15 minutes en raison d'un trop grand nombre de tentatives de connexion échouées.",
      action: "Vous pourrez réessayer après 15 minutes ou réinitialiser votre mot de passe si vous l'avez oublié.",
      footer: "Si vous n'êtes pas à l'origine de cette activité, veuillez contacter le support.",
    },
    ar: {
      subject: "تم قفل الحساب بسبب محاولات تسجيل دخول فاشلة",
      greeting: "تم قفل الحساب",
      intro: "تم قفل حسابك مؤقتًا لمدة 15 دقيقة بسبب كثرة محاولات تسجيل الدخول الفاشلة.",
      action: "يمكنك المحاولة مرة أخرى بعد 15 دقيقة، أو إعادة تعيين كلمة المرور إذا كنت قد نسيتها.",
      footer: "إذا لم تكن أنت من قام بهذه المحاولات، فيرجى التواصل مع فريق الدعم.",
    },
  };

  const c = content[locale] || content.en;

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'Kharita <no-reply@kharita.com>',
    to,
    subject: c.subject,
    text: `
${c.greeting}

${c.intro}

${c.action}

${c.footer}
    `.trim(),
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <html lang="${locale}" ${locale === "ar" ? 'dir="rtl"' : ""}>
      </head>
      <body style="font-family: Arial, sans-serif; padding:20px;">
        <h2>${c.greeting}</h2>
        <p>${c.intro}</p>
        <p>${c.action}</p>
        <hr>
        <p style="font-size:12px;color:#777;">${c.footer}</p>
      </body>
      </html>
    `,
  });
}

async function sendNewDeviceAlertEmail({ to, deviceName, locale, revokeToken, ip, location, authProvider }) {
  if (isTest) {
    console.log(`📧 [TEST] Would send new device alert to ${to}`);
    return;
  }
  const frontendBase = process.env.FRONTEND_URL;
  const revokeUrl = `${frontendBase}/2fa-revoke?token=${revokeToken}`;
  const isGoogle = authProvider === 'GOOGLE';

  const content = {
    en: {
      subject: 'New device login detected',
      greeting: 'New Device Login',
      intro: `A new device "${deviceName}" has logged into your account.`,
      location: `📍 Location: ${location || 'Unknown'}`,
      ipInfo: `🌐 IP Address: ${ip || 'Unknown'}`,
      action: 'If this was you, no further action is needed.',
      warning: isGoogle
        ? 'If this was not you, click the button below to revoke all sessions and review your Google account security settings.'
        : 'If this was not you, change your password immediately and revoke all sessions from your profile.',
      button: 'This wasn\'t me - Secure my account',
      footer: 'For your security, do not share this email with anyone.',
    },
    fr: {
      subject: 'Nouvelle connexion détectée depuis un appareil',
      greeting: 'Nouvel appareil connecté',
      intro: `Un nouvel appareil "${deviceName}" s'est connecté à votre compte.`,
      location: `📍 Localisation : ${location || 'Inconnue'}`,
      ipInfo: `🌐 Adresse IP : ${ip || 'Inconnue'}`,
      action: 'Si c\'était vous, aucune action n\'est nécessaire.',
      warning: isGoogle
        ? "Si ce n'était pas vous, cliquez sur le bouton ci-dessous pour révoquer toutes les sessions et vérifiez les paramètres de sécurité de votre compte Google."
        : "Si ce n'était pas vous, changez immédiatement votre mot de passe et révoquez toutes les sessions depuis votre profil.",
      button: 'Ce n\'était pas moi - Sécuriser mon compte',
      footer: 'Pour votre sécurité, ne partagez cet email avec personne.',
    },
    ar: {
      subject: 'تم اكتشاف تسجيل دخول من جهاز جديد',
      greeting: 'تسجيل دخول من جهاز جديد',
      intro: `قام جهاز جديد "${deviceName}" بتسجيل الدخول إلى حسابك.`,
      location: `📍 الموقع: ${location || 'غير معروف'}`,
      ipInfo: `🌐 عنوان IP: ${ip || 'غير معروف'}`,
      action: 'إذا كنت أنت من قام بذلك، لا حاجة لاتخاذ أي إجراء.',
      warning: isGoogle
        ? "إذا لم تكن أنت، فانقر على الزر أدناه لإلغاء جميع الجلسات ومراجعة إعدادات أمان حسابك على Google."
        : "إذا لم تكن أنت، فغيّر كلمة المرور الخاصة بك فورًا وألغِ جميع الجلسات من ملفك الشخصي.",
      button: 'لست أنا - قم بتأمين حسابي',
      footer: 'لأسباب أمنية، لا تشارك هذا البريد الإلكتروني مع أي شخص.',
    },
  };

  const c = content[locale] || content.en;

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'Kharita <no-reply@kharita.com>',
    to,
    subject: c.subject,
    text: `
${c.greeting}

${c.intro}

${c.location}
${c.ipInfo}

${c.action}

${c.warning}
${revokeUrl}

${c.footer}
    `.trim(),
    html: `
      <!DOCTYPE html>
      <html lang="${locale}">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${c.greeting}</h2>
        <p>${c.intro}</p>
        <p style="background: #f4f4f5; padding: 12px; border-radius: 6px;">
          ${c.location}<br/>
          ${c.ipInfo}
        </p>
        <p>${c.action}</p>
        <p style="color: #dc2626; font-weight: bold;">${c.warning}</p>
        <p style="margin: 24px 0;">
          <a href="${revokeUrl}" style="
            display: inline-block;
            background: #dc2626;
            color: #ffffff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: bold;
          ">
            ${c.button}
          </a>
        </p>
        <hr/>
        <p style="font-size: 12px; color: #777;">${c.footer}</p>
      </body>
      </html>
    `,
  });
}

module.exports = { sendResetEmail, sendOTPEmail, sendLockoutAlertEmail, sendNewDeviceAlertEmail };