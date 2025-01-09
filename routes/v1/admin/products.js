const router = require('express').Router();
const { ProductController: PC, AdminValidator: AV } = require('../../../controllers/v1/admin');
const { AuthService: AuthMiddleware } = require('../../../middleware/auth');
const gcp = require('../../../middleware/gcloud_storage');

// router.use(AuthMiddleware.Auth);
router.get('/list-categories', AV.validateList, PC.getListCategories);
router.get('/list-products', AV.validateList, PC.getListProducts);
router.post(
  '/create-product',
  gcp.uploadGambarBase64,
  AV.productValidationRules,
  PC.createNewProduct
);
router.get('/detail/:id', AV.validateGetId, PC.getProductById);
router.put('/edit/:id', gcp.uploadGambarBase64, AV.productValidationRules, PC.updateProduct);
router.delete('/:id', AV.validateGetId, PC.deleteProduct);

module.exports = router;
