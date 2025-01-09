const router = require('express').Router();
const { BannerController: BC } = require('../../../controllers/v1/banner');
const { AuthService: AuthMiddleware } = require('../../../middleware/auth');

router.get('/list-banner-pwa', BC.getListBannerPWA);

// router.use(AuthMiddleware.Auth);
router.get('/list-banner', BC.getListBanner);
router.get('/:id', BC.getBannerById);
router.delete('/:id', BC.getBannerById);
router.post('/', BC.createBanner);
router.put('/:id', BC.editBanner);

module.exports = router;
