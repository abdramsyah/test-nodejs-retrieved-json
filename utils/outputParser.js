const Log = require('./logger');
class outputParser {
  static async create(req, res, message, data) {
    const code = 201;
    return res.status(code).send({
      success: true,
      message_client: message,
      data: data,
    });
  }
  static async success(req, res, message, data) {
    const code = 200;
    return res.status(code).send({
      success: true,
      message_client: message,
      data,
    });
  }

  static async errorCustom(req, res, message, data) {
    const code = 422;
    return res.status(code).send({
      success: true,
      message_client: message,
      data: data,
    });
  }
  
  static async unprocessableEntity(req, res, message, data) {
    const code = 422;
    return res.status(code).send({
      success: true,
      message_client: message,
      data: data,
    });
  }

  static async errorValidatorFirst(req, res, message, data) {
    const code = 422;
    return res.status(code).send({
      success: true,
      message_client: message,
      data: data,
    });
  }

  static async successCustom(req, res, message, data) {
    const code = 200;
    return res.status(code).send({
      success: true,
      message_client: message,
      data,
    });
  }
  static async error(req, res, message, data) {
    const code = 500;
    return res.status(code).send({
      success: false,
      message_client: message,
      data: data,
    });
  }
  static async badRequest(req, res, message, data) {
    const code = 400;
    return res.status(code).send({
      success: false,
      message_client: message,
      data: data,
    });
  }

  static async notFound(req, res, message, data) {
    const code = 404;
    return res.status(code).send({
      success: false,
      message_client: message,
      data: data,
    });
  }
  static async conflict(req, res, message, data) {
    const code = 409;
    return res.status(code).send({
      success: false,
      message_client: message,
      data: data,
    });
  }
  static async PayloadTooLarge(req, res, message, data) {
    const code = 413;
    return res.status(code).send({
      success: false,
      message_client: message,
      data: data,
    });
  }
  static async internalServerError(req, res, err, message, functionName) {
    // airbrake.notify(err);
    Log(err, `Error in ${functionName}`);
    const code = 500;
    const message_server = err?.details?.message || err.message;
    // LogGenerator.exec(res.logs, code, message_server, req);

    return res.status(code).send({
      success: false,
      message_client: `Gagal ${message}, silahkan coba lagi`,
      data: null,
      error: {
        message_server: message_server,
        service_name: err?.details?.service_name || 'grosri-be-api',
        service_code_error: err.code,
        validation: err?.details?.validation,
      },
      request: {
        // id: req.request_id_log,
        // label: Enums.log_collection.api_log
      },
    });
  }

  static async unauthorized(req, res, clientMessage, serverMessage) {
    const code = 401;
    return res.status(code).send({
      success: false,
      message_client: clientMessage,
      data: null,
    });
  }

  static async restricted(req, res, clientMessage, serverMessage) {
    const code = 403;
    return res.status(code).send({
      success: false,
      message_client: clientMessage,
      data: null,
    });
  }
}

module.exports = {
  outputParser,
};
