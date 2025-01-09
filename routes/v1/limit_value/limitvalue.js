const router = require('express').Router();
const {
  LimitValueController: LVC,
} = require('../../../controllers/v1/limit_value');
const { AuthService: AuthMiddleware } = require('../../../middleware/auth');

router.use(AuthMiddleware.Auth);
router.get('/detail', LVC.detailLimitValue);
router.put('/update', LVC.updateHideLimitValue);

module.exports = router;
