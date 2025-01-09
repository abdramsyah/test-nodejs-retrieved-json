const { OauthController } = require('./auth');
const { UserController } = require('./user');
const { NotificationController } = require('./notification');
const { PromoController } = require('./promo');
const UserValidator = require('./validator.js');

module.exports = {
  OauthController,
  UserController,
  NotificationController,
  PromoController,
  UserValidator,
};
