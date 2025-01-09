const router = require('express').Router();
const { OrderController: LVC } = require('../../../controllers/v1/order');
// const { AuthService: AuthMiddleware } = require('../../../middleware/auth');

// router.use(AuthMiddleware.Auth);
router.get('/pre-order', LVC.preOrder);
router.post('/', LVC.createOrder);
router.get('/', LVC.getListOrder);
router.get('/:order_number', LVC.getDetailOrder);
router.put('/:order_number', LVC.cancelOrder);
// router.get('/', LVC.detailLimitValue);

module.exports = router;
