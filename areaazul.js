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

module.exports.log = require('./configuration/logging');
module.exports.db = require('./configuration/database');

[
  'estado', 'cidade', 'conta', 'pessoa', 'pessoa_fisica',
  'pessoa_juridica', 'revendedor', 'contrato', 'funcionario', 'veiculo',
  'configuracao', 'movimentacao_conta',
  'usuario', 'usuario_revendedor', 'usuario_administrativo', 'usuario_fiscal',
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
