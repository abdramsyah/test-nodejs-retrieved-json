const { query, param, body } = require('express-validator');
// const constant = require('../../../config/constant');
// const { validDateFormat } = require('../../../helpers/generalHelpers');

const validateList = [
  query('page').optional().isInt().withMessage('page param is not correct'),
  query('size').optional().isInt().withMessage('size param is not correct'),
  query('search').optional().isString(),
];

const validateGetId = [param('id').isInt().withMessage('param is not correct')];

const validateCreateNewPartner = [
  // Name
  body('name')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name should not exceed 100 characters')
    .matches(/^[A-Za-z ]+$/, 'g')
    .withMessage('Name should only contain alphabetic characters and spaces'),

  // Address
  body('address')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Address is required')
    .isLength({ max: 100 })
    .withMessage('Address should not exceed 100 characters'),

  // Telp
  body('telp')
    .notEmpty()
    .withMessage('Telp is required')
    .isInt()
    .withMessage('Telp should be an integer')
    .isLength({ max: 16 })
    .withMessage('Telp should not exceed 16 characters'),

  // Email
  body('email')
    .trim()
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email is not valid')
    .isLength({ max: 100 })
    .withMessage('Email should not exceed 100 characters'),
];

module.exports = {
  validateList,
  validateGetId,
  validateCreateNewPartner,
};
