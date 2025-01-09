const router = require('express').Router();
const company = require('./company');

router.use(company);

module.exports = router;
