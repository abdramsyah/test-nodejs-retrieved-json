const router = require('express').Router();
const cart = require('./cart');
const order = require('./order');

router.use(cart);
router.use('/', order);

module.exports = router;
