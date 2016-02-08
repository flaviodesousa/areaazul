'use strict';

var debug = require('debug')('areaazul:helpers:util');
var AreaAzul = require('../../areaazul');
var logger = AreaAzul.log;
var bcrypt = require('bcrypt');
var AreaAzulMailer = require('areaazul-mailer');
var moment = require('moment');
var uuid = require('node-uuid');

exports.enviarEmailConfirmacao = function(entidade, login, senha) {
  var message = {
    from: 'AreaAzul <cadastro@areaazul.org>',
    to: entidade.email,
    cc: 'cadastro@areaazul.org',
    subject: 'Confirmação de cadastro - AreaAzul',
    html: '<p>Por favor ' + entidade.nome +
      ' clique no link abaixo para acessar a aplicação areaazul.</br>' +
      'http://usuario.demo.areaazul.org/</br>' +
      'Usuario: ' + login + '</br>' +
      'Senha é: ' + senha + '.',
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
      'http://demo.areaazul.org/' + uuid + '.',
  };
  AreaAzulMailer.enviar.emailer(message);
};

function getRandomChar() {
  var ascii = [
    [48, 57],
    [64, 90],
    [97, 122],
  ];
  var i = Math.floor(Math.random() * ascii.length);
  return String.fromCharCode(
    Math.floor(Math.random() *
      (ascii[i][1] - ascii[i][0])) + ascii[i][0]);
}

exports.generate = function() {
  this.pass = '';
  var chars = 4;

  for (var i = 0; i < chars; i++) {
    this.pass += getRandomChar();
  }
  return this.pass;
};

exports.criptografa = function(password) {
  var salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

exports.senhaValida = function(senha, hash) {
  return bcrypt.compareSync(senha, hash);
};

exports.converteData = function(data) {
  return moment(Date.parse(data)).format('YYYY-MM-DD');
};

exports.log = function(log, type) {
  if (!type) {
    logger.info(log);
  } else {
    logger(type, log);
  }

};

exports.geradorUUIDAleatorio = function() {
  return uuid.v4();
};

exports.placaSemMascara = function(valor) {
  var valorComMascara = valor;

  valorComMascara = valorComMascara.replace('.', '');
  valorComMascara = valorComMascara.replace('-', '');
  valorComMascara = valorComMascara.replace('/', '');
  valorComMascara = valorComMascara.replace('_', '');
  valorComMascara = valorComMascara.replace('*', '');

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

exports.dataValida = function(_data) {
  debug('datavalida()', _data);
  return moment(_data, 'DD-MM-YYYY').isValid();
};
