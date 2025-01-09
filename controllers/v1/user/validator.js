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

  body('phone')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Phone is required')
    .isNumeric()
    .withMessage('Phone number must be numeric')
    .isLength({ max: 15 })
    .withMessage('Phone number must be at most 15 numbers'),

  body('password')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Password is required')
    .isLength({ min: 9 })
    .withMessage('Password must be at least 9 characters'),

  body('password_confirm')
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
    .withMessage('Password confirmation does not match password'),
];

const validateLogin = [
  body('email')
    .trim()
    .not()
    .isEmpty()
    .withMessage('email required')
    .isEmail()
    .withMessage('email not valid'),
  body('password').trim().not().isEmpty().withMessage('password required'),
];

module.exports = {
  validateList,
  validateGetId,
  validateCreateNewUser,
  validateLogin,
};
