'use strict';

var debug = require('debug')('areaazul:main');
var util = require('util');

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

module.exports.log = require('./logging');
module.exports.db = require('./database');
module.exports.util = require('areaazul-utils');

[
  'estado', 'cidade', 'conta', 'contrato', 'pessoa', 'pessoa_fisica',
  'pessoa_juridica', 'usuario_revendedor', 'revendedor', 'funcionario',
  'veiculo', 'configuracao', 'movimentacao_conta',
  'usuario', 'usuario_administrativo', 'usuario_fiscal',
  'usuario_has_veiculo', 'ativacao', 'fiscalizacao'
].forEach(model => {
  debug('Registrando modelo ' + model);
  require('./models/models/' + model);
});

[
  'ativacoes', 'cidades', 'contas', 'contratos', 'estados', 'fiscalizacoes',
  'funcionarios', 'movimentacoes_contas', 'pessoas', 'pessoas_fisicas',
  'pessoas_juridicas', 'revendedores', 'usuarios', 'usuarios_have_veiculos',
  'usuarios_revendedores', 'usuarios_fiscais', 'veiculos'
].forEach(collection => {
  debug('Registrando coleção ' + collection);
  require('./models/collections/' + collection);
});

module.exports.BusinessException = BusinessException;
module.exports.AuthenticationError = AuthenticationError;

module.exports.log.info('AreaAzul configurada');
