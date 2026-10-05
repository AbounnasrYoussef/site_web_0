-admin to specific user notif - db - read_at
-admin broadcast to all users - db - read_at
-user broadcast to all admins - db - fulfilled - fulfilled by who
-fav icon
-seo
-presentation 3la auth backend kaml
-privacy 
-Terms of Service.

COMMIT:
    -


STYLE:
    -random background colors when select on step4

-unit testing for adding updating deleting diplomas fields userDiplomas_fields etc

THEORY
    -use ref -use context - use callback
    -use memo

-- FUTURE:
    -notification component
    -add cloudflare Turnstile to /register and /forgot password


#PROFILE PAGE:
    -The uploaded file is not a valid image error message -> toaster dyal toujana
#EMAIL:
    -move the authbackend/public pngs into frontend/public to get shown in the email 

KEEP IN MIND
    email:
        -ola biti l'icons ibano use ssh -R 80:localhost:5000 serveo.net o copy link to ASSETS_BASE_URL



useQuery = for GET requests (reading/fetching data).
useMutation = for POST/PUT/DELETE requests (creating/updating/deleting data).

XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    -Account-lockout alert email.

Phase 8 — Ops & tests
    -Extend cron cleanup to cover expired OTPs, expired device_alerts, stale trusted_until.
    -Full test sweep: role hierarchy, ownership middleware, OTP limiting, lockout, revoke-flow for both auth providers, refresh-fingerprint mismatch, Google callback paths.


tests specific filieres
npm test -- --testPathPatterns="auth.2fa|auth.login" > test.output.txt 2>&1

next:
    -notification

once in production:
    -move public images from backend to frontend and update the ASSETS_BASE_URL to the front, and also update the icons path in auth_backend/email.js 
    -email: privacy@kharita.ma contact@kharita.ma legal@kharita.ma
    -use (Plausible, Umami) for analytics
    -cloudflare flogin/regiter/form main page
    -cachi blacklisted tokens - pages 
    -user support email in console google cloud for kharita app - contact info too - update google callback url
    -submit app to get verifed by google
    -auth tests github actions
    -cleanup function on cron tab: cleanupBlacklistedTokens and cleanupPasswordResetTokens with a unified cleanup that also removes expired refresh tokens refreshTokenModel.deleteExpiredTokens
    -device management page
    -implement an ai to help with translation programs/unis/etc
    -alert mlli yti7 chi service
    -backup database
    -trademark logo
    -logo in email
    -IP geolocation creati 