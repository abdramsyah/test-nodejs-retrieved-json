const router = require('express').Router();
const { CompanyController: CC, PartnerValidator: PV } = require('../../../controllers/v1/company');

// router.get('/list-company', CC.getListPartner);
// router.post('/', PV.validateCreateNewPartner, CC.createNewPartner);

router.get('/retrieved-json', CC.retrieved);

module.exports = router;
