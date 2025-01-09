const router = require('express').Router();
const { CategoryController: CC, AdminValidator: AV } = require('../../../controllers/v1/admin');
const { AuthService: AuthMiddleware } = require('../../../middleware/auth');
const gcp = require('../../../middleware/gcloud_storage');

// router.use(AuthMiddleware.Auth);
router.get('/list-orders', AV.validateList, CC.getListOrders);
router.get('/detail/:id', AV.validateGetId, CC.getDetailOrders);

module.exports = router;
