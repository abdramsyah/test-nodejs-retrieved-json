const router = require('express').Router();
const { CategoryController: CC, AdminValidator: AV } = require('../../../controllers/v1/admin');
// const { AuthService: AuthMiddleware } = require('../../../middleware/auth');
const gcp = require('../../../middleware/gcloud_storage');

// router.use(AuthMiddleware.Auth);
router.get('/list-categories', AV.validateList, CC.getListCategories);
router.post(
  '/create-category',
  gcp.uploadGambarBase64,
  AV.categoryValidationRules,
  CC.createNewCategory
);
router.get('/detail/:id', AV.validateGetId, CC.getCategoryById);
router.delete('/:id', AV.validateGetId, CC.deleteCategory);
router.put('/edit/:id', gcp.uploadGambarBase64, AV.categoryPutValidationRules, CC.updateCategory);

module.exports = router;
