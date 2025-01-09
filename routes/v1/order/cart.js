const router = require('express').Router();
const { OrderController: Order } = require('../../../controllers/v1/order');
const { AuthService: AuthMiddleware } = require('../../../middleware/auth');

router.use(AuthMiddleware.Auth);
router.post('/addcart', Order.addToCart);
router.post('/deletecart', Order.deleteCart);
router.get('/cart', Order.getCart);
// router.get('/subscribe', Order.getCart)

module.exports = router;
