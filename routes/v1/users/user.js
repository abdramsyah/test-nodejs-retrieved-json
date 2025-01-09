const router = require('express').Router();
const {
  UserController: UC,
  // UserValidator: UV,
} = require('../../../controllers/v1/user');

const { AuthService: AuthMiddleware } = require('../../../middleware/auth');
const gcp = require('../../../middleware/gcloud_storage');


router.get('/faq', UC.faq);
router.get('/', UC.profile);
router.post('/create-tac', UC.createTermsAndConditions);
router.get('/terms-and-conditions', UC.getAllTermsAndConditions);
router.get('/privacy-policy', UC.getAllPrivacyPolicy);
router.use(AuthMiddleware.Auth);
router.post('/update', UC.updateProfile);
router.post('/photo', gcp.uploadGambarBase64, UC.updatePhotoProfile);

module.exports = router;
