const router = require('express').Router();
const { PromoController: Promo } = require('../../../controllers/v1/promo');

router.post('/add-event', Promo.addEvent);
// router.post('/deletecart', Promo.addEvent)
router.get('/:slug', Promo.getEvent);

module.exports = router;
