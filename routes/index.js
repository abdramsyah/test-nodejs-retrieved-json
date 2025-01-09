const router = require('express').Router();

// const oauth = require('./oauth/oauth')
const v1 = require('./v1');

/* GET home page. */
router.get('/', function (req, res) {
  res.send(' >>> BE GROSRY RUN <<< ');
});

router.use('/api/v1', v1);
router.use('/api/admin/v1/', v1);

module.exports = router;
