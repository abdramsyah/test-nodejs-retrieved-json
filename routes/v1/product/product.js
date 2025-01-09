const router = require('express').Router();
const { ProductController: Product } = require('../../../controllers/v1/products');
const { AuthService: AuthMiddleware } = require('../../../middleware/auth');

router.get('/search', Product.searchProduct);
router.get('/detail', Product.detailProduct);
router.post('/sugges-produk', Product.createSuggestProduct);

router.use(AuthMiddleware.Auth);
router.get('/favorit', Product.favorit);
router.post('/addfavorit', Product.createFavorit);
router.post('/deletefavorit', Product.deleteFavorit);
router.get('/search-favorit', Product.searchProductFovorit);

router.post('/subscribe', Product.subscribe);
router.post('/canceled-order', Product.updateSubscribe);
router.get('/get-list-subscribe-month', Product.getSubscribeMonth);
router.get('/get-list-subscribe-week', Product.getSubscribeWeek);

router.get('/list-history-subscribe', Product.gethistorySubscribeList);
router.get('/detail-history-subscribe', Product.getDetailHistorySubscribeList);

router.get('/detail-subscribe', Product.detailSubscribe);

module.exports = router;
