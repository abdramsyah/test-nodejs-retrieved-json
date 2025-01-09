const router = require('express').Router();

// const oauth = require('./oauth/oauth')
const user = require('./users');
const product = require('./product');
const order = require('./order');
const promo = require('./promo');
const event = require('./event');
const admin = require('./admin');
const banner = require('./banner');
const company = require('./company');
const limitValue = require('./limit_value');

/* GET home page. */

router.use('/user', user);
router.use('/product', product);
router.use('/order', order);
router.use('/promo', promo);
router.use('/event', event);

// admin Operations
router.use('/admin', admin);
router.use('/banner', banner);
router.use('/company', company);


router.use('/data', company);
router.use(limitValue);

module.exports = router;
