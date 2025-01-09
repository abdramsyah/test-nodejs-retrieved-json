const router = require('express').Router();
const { UserController: UC, UserValidator: UV } = require('../../../controllers/v1/user');
const { AuthService: AuthMiddleware } = require('../../../middleware/auth');
const auth = require('./auth');
const user = require('./user');
const notif = require('./notification');
const promo = require('./promo');

router.get('/', UC.home);
router.post('/register', UV.validateCreateNewUser, UC.registerNewUser);
router.use('/auth', auth);
router.use('/profile', user);
router.use('/notification', notif);
router.use('/promo', promo);

router.use(AuthMiddleware.Auth);
router.post('/activated-grosri-value', UC.activatedGrosriValue);

module.exports = router;
