const router = require('express').Router();
const event = require('./event');

router.use(event);

module.exports = router;
