const router = require('express').Router();
const banner = require('./banner');

router.use(banner);

module.exports = router;
