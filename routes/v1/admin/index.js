const router = require('express').Router();
const admin = require('./admin');
const category = require('./category');
const products = require('./products');
const order = require('./orders');
const { AdminController: Admin, AdminValidator: AV } = require('../../../controllers/v1/admin');
const { AuthService: AuthMiddleware } = require('../../../middleware/auth');

router.use(AuthMiddleware.Auth);
router.use('/user-managament', admin);
router.use('/category', category);
router.use('/product', products);
router.use('/order', order);

// router.use(AuthMiddleware.Auth);
router.post('/update-status-order', Admin.updateSubscribe);

module.exports = router;
