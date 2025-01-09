const constant = require('../../../config/constant');
const { LimitValue } = require('../../../models');
const { Log } = require('../../../utils/customLog');
const { outputParser } = require('../../../utils/outputParser');
const {
  LIMIT_VALUE_NOT_FOUND,
  SUCCESS_GET_DETAIL_LIMIT_VALUE,
  FAIL_GET_DETAIL_LIMIT_VALUE,
  LIMIT_VALUE_HIDE_SUCCESS,
  LIMIT_VALUE_HIDE_FAIL,
} = require('../../../utils/responseMessages');

class LimitValueController {
  static async detailLimitValue(req, res) {
    Log.info('[LOG]: Detail Limit Value ');
    try {
      const decode = req.payload;
      const user_id = decode.id;
      console.log({ decode, user_id });

      const limit_value = await LimitValue.findOne({
        where: {
          user_id,
          status: constant.LIMIT_VALUE.AKTIF,
        },
      });

      if (!limit_value) {
        return outputParser.notFound(req, res, LIMIT_VALUE_NOT_FOUND, null);
      }

      return outputParser.success(req, res, SUCCESS_GET_DETAIL_LIMIT_VALUE, {
        limit_value,
      });
    } catch (err) {
      return outputParser.error(req, res, FAIL_GET_DETAIL_LIMIT_VALUE);
    }
  }

  static async updateHideLimitValue(req, res) {
    Log.info('[LOG]: Update Hide Limit Value');
    try {
      const decode = req.payload;
      const user_id = decode.id;

      const limit_value = await LimitValue.findOne({
        where: {
          user_id,
          status: constant.LIMIT_VALUE.AKTIF,
        },
      });

      if (!limit_value) {
        return outputParser.notFound(req, res, LIMIT_VALUE_NOT_FOUND, null);
      }

      const newIsHide = req.body.is_hide;
      limit_value.is_hide = newIsHide;

      // Menyimpan perubahan
      await limit_value.save();

      return outputParser.success(req, res, LIMIT_VALUE_HIDE_SUCCESS, {
        limit_value,
      });
    } catch (err) {
      return outputParser.error(req, res, LIMIT_VALUE_HIDE_FAIL);
    }
  }
}

module.exports = {
  LimitValueController,
};
