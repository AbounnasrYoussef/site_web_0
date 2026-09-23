const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, changePasswordSchema, updateProfileSchema, changeOwnPasswordSchema } = require('../middleware/validationSchemas');
const authController = require('../controllers/auth.controller');
const tokenAttemptLimiter = require('../middleware/tokenAttemptLimiter');
const { forgotPasswordSchema, resetPasswordSchema } = require('../middleware/validationSchemas');

const multer = require('multer');
const { loginIpRateLimit, googleRedirectRateLimit, googleCallbackRateLimit, registerIpRateLimit, resetLimiter, refreshRateLimit, verify2faRateLimit, profileUpdateRateLimit, toggle2faRateLimit, changeOwnPasswordRateLimit } = require('../middleware/AuthRateLimit');
const upload = multer({ storage: multer.memoryStorage() });


router.post('/register', registerIpRateLimit, registerSchema, validate, authController.register);
router.post('/login', loginIpRateLimit, loginSchema, validate, authController.login);
router.post('/refresh', refreshRateLimit, authController.refreshToken);

router.post('/logout', authController.logout);

router.get('/profile', authenticate, authController.getProfile);
router.patch('/profile', authenticate, profileUpdateRateLimit, upload.single('profile_pic'), updateProfileSchema, validate, authController.updateProfile);

router.post('/forgot-password', resetLimiter, forgotPasswordSchema, validate, authController.forgotPassword);
router.post('/reset-password', tokenAttemptLimiter, resetPasswordSchema, validate, authController.resetPassword);

router.get('/validate', authenticate, authController.validateToken);

router.post('/verify-2fa', verify2faRateLimit, authController.verify2FA);
router.patch('/profile/2fa', authenticate, toggle2faRateLimit, authController.toggle2FA);

router.post('/2fa/revoke-all', authController.revokeAllOnSuspicion);
router.post('/resend-2fa', authController.resend2FA);
router.post('/change-force-password', changePasswordSchema, validate, authController.changePassword);
router.post('/change-own-password', authenticate, changeOwnPasswordRateLimit, changeOwnPasswordSchema, authController.changeOwnPassword);

router.get('/google', googleRedirectRateLimit, authController.googleRedirect);
router.get('/google/callback', googleCallbackRateLimit, authController.googleCallback);

router.get('/admin-test', authenticate, authorize('ADMIN'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});

module.exports = router;


