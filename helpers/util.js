'use strict';

var debug = require('debug')('areaazul:helpers:util');
var AreaAzul = require('../../areaazul');
var AreaAzulMailer = require('areaazul-mailer');
var moment = require('moment');
var uuid = require('node-uuid');

exports.enviarEmailConfirmacao = function(entidade, login) {
  var message = {
    from: 'AreaAzul <cadastro@areaazul.org>',
    to: entidade.email,
    cc: 'cadastro@areaazul.org',
    subject: 'Confirmação de cadastro - AreaAzul',
    html: '<p>Por favor ' + entidade.nome +
      ' clique no link abaixo para acessar a aplicação areaazul.</br>' +
      '<a href="http://usuario.demo.areaazul.org">Área Azul</a></br>' +
      'Usuario: ' + login
  };
  AreaAzulMailer.enviar.emailer(message);
};

exports.enviarEmailNovaSenha = function(email, nome, uuid) {
  var message = {
    from: 'AreaAzul <cadastro@areaazul.org>',
    to: email,
    cc: 'cadastro@areaazul.org',
    subject: 'AreaAzul nova senha ',
    html: '<p>Por favor ' + nome +
      ' clique no link abaixo para alterar sua senha.</br>' +
      '<a href="http://demo.areaazul.org/' + uuid + '">Trocar Senha</a>.'
  };
  AreaAzulMailer.enviar.emailer(message);
};

exports.converteData = function(data) {
  return moment(Date.parse(data)).format('YYYY-MM-DD');
};

exports.geradorUUIDAleatorio = function() {
  return uuid.v4();
};

exports.placaSemMascara = function(valor) {
  var valorComMascara = valor;

  valorComMascara = valorComMascara.replace(/[^A-Za-z0-9]/, '');

  return valorComMascara;
};

exports.formataData = function(_data) {
  var m;
  if (!_data) {
    return null;
  }
  if (_data instanceof Date) {
    m = moment(_data);
  } else if (typeof _data === 'string') {
    m = moment(_data, 'DD-MM-YYYY');
  } else {
    throw new Error('unexpected type: ' + typeof _data);
  }
  return m.format('DD/MM/YYYY');
};

exports.dataValida = function(dataString, formato) {
  if (!formato) {
    formato = 'DD/MM/YYYY';
  }
  var dataValida = moment(dataString, formato, true);
  debug('datavalida()', dataString, dataValida.isValid());
  if (!dataValida.isValid()) {
    dataValida = null;
  }
  return dataValida;
};
