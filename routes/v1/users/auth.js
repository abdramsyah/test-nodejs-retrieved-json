const router = require('express').Router();
const { OauthController: Auth } = require('../../../controllers/v1/user');
const { validateLogin } = require('../../../controllers/v1/user/validator');
const { AuthService: AuthMiddleware } = require('../../../middleware/auth');

router.post('/login', validateLogin, Auth.login);
router.post('/request-otp', Auth.requestEmail);
router.post('/resend-otp', Auth.resendEmail);
// router.post('/send-otp-phone', Auth.otpPhone) // next progress
router.post('/verify-otp', Auth.verifiedOtp);
router.post('/forgot-password', Auth.forgotPassword);
router.post('/reset-password', Auth.resetPassword);
router.post('/validate-reset-password', Auth.validatePassword);
router.post('/update-password', Auth.updatePassword);
router.use(AuthMiddleware.Auth);
router.post('/logout', Auth.logout);
router.post('/refreshtoken', Auth.refreshToken);

module.exports = router;
