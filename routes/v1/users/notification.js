const router = require('express').Router();
const { NotificationController: Notif } = require('../../../controllers/v1/user');
const { AuthService: AuthMiddleware } = require('../../../middleware/auth');

router.use(AuthMiddleware.Auth);
router.get('/general', Notif.getNotificationGeneral);
router.get('/promo', Notif.getNotificationPromo);
router.get('/promo/:slug', Notif.getDetailPromoEvent);
// router.get('/detail/:id', Notif.detailNotification);
router.post('/', Notif.createNotification);

module.exports = router;
