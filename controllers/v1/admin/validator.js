const { query, param, body } = require('express-validator');
// const constant = require('../../../config/constant');
// const { validDateFormat } = require('../../../helpers/generalHelpers');

const validateList = [
  query('page').optional().isInt().withMessage('page param is not correct'),
  query('size').optional().isInt().withMessage('size param is not correct'),
  query('search').optional().isString(),
];

const validateGetId = [param('id').isInt().withMessage('param is not correct')];

const validateCreateNewUser = [
  body('email')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email is not valid'),

  body('full_name')
    .trim()
    .not()
    .isEmpty()
    .withMessage('full_name required')
    .matches(/^[A-Za-z ]+$/, 'g')
    .withMessage('full_name should only contain alphabetic characters and spaces'),

  body('role')
    .trim()
    .not()
    .isEmpty()
    .withMessage('role required')
    .isIn(['operation', 'super_admin'])
    .withMessage('role must be "super_admin" or "operation"'),
];

// CRUD CATEGORIES
const categoryValidationRules = [
  body('image').trim().not().isEmpty().withMessage('Image is required'),
  // body('description')
  //   .trim()
  //   .not()
  //   .isEmpty()
  //   .withMessage('Description is required')
  //   .isLength({ max: 255 })
  //   .withMessage('Description must be at   most 255 characters'),

  body('category_name')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Category Name is required')
    .isLength({ max: 255 })
    .withMessage('Category Name must be at most 255 characters'),
  // body('sort')
  //   .isInt()
  //   .withMessage('Prioritas must be an integer')
  //   .custom((value) => value >= 0 && value <= 100)
  //   .withMessage('Prioritas must be between 0 and 100'),
  body('status')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Status is required')
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Status must be "ACTIVE" or "INACTIVE'),
];

const categoryPutValidationRules = [
  body('category_name').trim().not().isEmpty().withMessage('Category Name is required'),
  body('status')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Status is required')
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Status must be "ACTIVE" or "INACTIVE'),
];

const productValidationRules = [
  body('image').trim().optional(),
  body('product_name').trim().not().isEmpty().withMessage('Product Name is required'),
  body('description').trim().not().isEmpty().withMessage('Description is required'),
  body('base_price').isFloat().withMessage('Base Price must be a floating-point number'),
  body('stock').isInt().withMessage('Stock must be an integer'),
  body('discount').isBoolean().optional(),
  body('discount_type').isString().optional(),
  body('prioritas').isInt().optional(),
  body('status')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Status is required')
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Status must be "ACTIVE" or "INACTIVE'),
];

const productPutValidationRules = [
  body('product_name').trim().not().isEmpty().withMessage('Product Name is required'),
  body('description').trim().not().isEmpty().withMessage('Description is required'),
  body('base_price').isInt().withMessage('Base Price must be an integer'),
  body('stock').isInt().withMessage('Stock must be an integer'),
  body('poto').trim().optional(),
  body('discount').isInt().optional(),
  body('is_event_product').isBoolean().optional(),
  body('event_id').isInt().optional(),
  body('status')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Status is required')
    .isIn(['ACTIVE', 'INACTIVE'])
    .withMessage('Status must be "ACTIVE" or "INACTIVE'),
];

module.exports = {
  validateList,
  validateGetId,
  validateCreateNewUser,
  categoryValidationRules,
  categoryPutValidationRules,
  productValidationRules,
  productPutValidationRules,
};
