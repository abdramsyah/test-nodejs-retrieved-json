const router = require('express').Router();
const { PromoController: Promo } = require('../../../controllers/v1/promo');

router.get('/:slug', Promo.getPromo);

module.exports = router;
