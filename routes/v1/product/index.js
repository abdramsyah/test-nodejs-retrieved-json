const router = require('express').Router();
const product = require('./product');

router.use(product);

module.exports = router;
