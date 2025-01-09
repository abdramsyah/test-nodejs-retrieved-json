const router = require('express').Router();
const { PromoController: Promo } = require('../../../controllers/v1/user');
const { AuthService: AuthMiddleware } = require('../../../middleware/auth');

router.use(AuthMiddleware.Auth);
router.get('/', Promo.getPromo);
router.get('/detail/:id', Promo.detailPromo);

module.exports = router;
