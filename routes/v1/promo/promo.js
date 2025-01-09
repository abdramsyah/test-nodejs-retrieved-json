const router = require('express').Router();
const { PromoController: Promo } = require('../../../controllers/v1/promo');

router.post('/add-event', Promo.addEvent);
router.get('/section/home', Promo.promoSection);
// router.get('/:slug', Promo.getEvent);

/* ::: OPERATIONS ::: */
router.get('/list-promo', Promo.listPromo);
router.post('/create-promo', Promo.createPromo);

module.exports = router;
