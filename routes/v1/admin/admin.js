const router = require('express').Router();
const { AdminController: Admin, AdminValidator: AV } = require('../../../controllers/v1/admin');
const { AuthService: AuthMiddleware } = require('../../../middleware/auth');

router.get('/get-list', Admin.getListAdmin);
router.post('/create', AV.validateCreateNewUser, Admin.createNewAdmin);
router.get('/detail/:id', AV.validateGetId, Admin.getAdminById);
router.put('/edit/:id', AV.validateCreateNewUser, Admin.updateAdmin);
// router.delete('/delete/:id', Admin.updateSubscribe);

module.exports = router;
