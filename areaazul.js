'use strict';

var debug = require('debug')('areaazul:main');
var util = require('util');
const log = require('./logging');

var BusinessException = function(message, details) {
  this.message = message;
  this.details = details;
};
util.inherits(BusinessException, Error);

var AuthenticationError = function(message, details) {
  this.message = message;
  this.details = details;
};
util.inherits(AuthenticationError, Error);

require('./database');

module.exports.BusinessException = BusinessException;
module.exports.AuthenticationError = AuthenticationError;
module.exports.facade = {
  Ativacao: require('./facade/ativacao'),
  Cidade: require('./facade/cidade'),
  Configuracao: require('./facade/configuracao'),
  Fiscalizacao: require('./facade/fiscalizacao'),
  MovimentacaoDeConta: require('./facade/movimentacao_conta'),
  PessoaFisica: require('./facade/pessoa_fisica'),
  PessoaJuridica: require('./facade/pessoa_juridica'),
  Revendedor: require('./facade/revendedor'),
  Usuario: require('./facade/usuario'),
  UsuarioAdministrativo: require('./facade/usuario_administrativo'),
  UsuarioFiscal: require('./facade/usuario_fiscal'),
  UsuarioHasVeiculo: require('./facade/usuario_has_veiculo'),
  UsuarioRevendedor: require('./facade/usuario_revendedor'),
  Veiculo: require('./facade/veiculo')
};

log.info('AreaAzul configurada');
debug('AreaAzul iniciada');
