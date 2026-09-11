const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, changePasswordSchema, updateProfileSchema } = require('../middleware/validationSchemas');
const authController = require('../controllers/auth.controller');
const authLimiter = require('../middleware/authLimiter');
const resetLimiter = require('../middleware/resetLimiter');
const tokenAttemptLimiter = require('../middleware/tokenAttemptLimiter');
const { forgotPasswordSchema, resetPasswordSchema } = require('../middleware/validationSchemas');


router.post('/register', authLimiter, registerSchema, validate, authController.register);
router.post('/login', authLimiter, loginSchema, validate, authController.login);
router.post('/refresh', authLimiter, validate, authController.refreshToken);

router.post('/logout', authController.logout);

router.get('/profile', authenticate, authController.getProfile);
router.patch('/profile', authenticate, updateProfileSchema, validate, authController.updateProfile);

router.post('/forgot-password', resetLimiter, forgotPasswordSchema, validate, authController.forgotPassword);
router.post('/reset-password', tokenAttemptLimiter, resetPasswordSchema, validate, authController.resetPassword);

router.get('/validate', authenticate, authController.validateToken);

router.post('/verify-2fa', authLimiter, authController.verify2FA);
router.patch('/profile/2fa', authenticate, authController.toggle2FA);

router.post('/2fa/revoke-all', authController.revokeAllOnSuspicion);
router.post('/resend-2fa', authController.resend2FA);
router.post('/change-password', changePasswordSchema, validate, authController.changePassword);

router.get('/google', authController.googleRedirect);
router.get('/google/callback', authLimiter, authController.googleCallback);

router.get('/admin-test', authenticate, authorize('ADMIN'), (req, res) => {
  res.json({ message: 'Admin access granted' });
});

module.exports = router;


