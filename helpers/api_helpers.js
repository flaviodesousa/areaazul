/**
 * Created by flavio on 5/17/17.
 */
'use strict';

const log = require('../logging');
const UUID = require('uuid');


module.exports.status400 = function status400(
  res, businessException, message = businessException.message, data = undefined) {
  const uuid = UUID.v4();
  log.warn(message, Object.assign({ uuid, businessException }, data));
  res.status(400).send(businessException);
};


module.exports.status500 = function status500(
  res, exception, message = exception.message, data = undefined) {
  const uuid = UUID.v4();
  log.warn(message, Object.assign({ uuid, exception }, data));
  res.status(500).send(`Erro interno ${uuid}`);
};
