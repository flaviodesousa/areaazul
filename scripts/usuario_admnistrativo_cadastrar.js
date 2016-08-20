#!/usr/bin/env node

'use strict';

var moment = require('moment');
var AreaAzul = require('../areaazul');
var Bookshelf = require('bookshelf').conexaoMain;

var a = require('yargs').argv;

if (!a.login || !a.senha) {
  console.log('--login <login> --senha <senha>');
  console.log('  [--autorizacao "niveldeacesso"]');
  console.log('  [--nome "nome"]');
  console.log('  [--email <email>]');
  console.log('  [--telefone "telefone"]');
  console.log('  [--cpf <cpf>]');
  console.log('  [--nascimento AAAA-MM-DD]');
  console.log('  [--sexo <sexo>]');
  process.exit(0);
}

Bookshelf.model('UsuarioAdministrativo').cadastrar({
  login: a.login,
  senha: a.senha,
  nome: a.nome || a.login,
  email: a.email || 'teste@areaazul.org',
  telefone: a.telefone || '1234567890',
  cpf: a.cpf || a.login,
  autorizacao: a.autorizacao || 'normal',
  data_nascimento: a.nascimento && moment(a.nascimento) || moment(),
})
  .then(function(u) {
    console.dir(u.toJSON());
    console.log('Usuario ID=' + u.id);
  })
  .then(function() {
    process.exit(0);
  })
  .catch(function(e) {
    console.error('Erro ao criar usuario: ' + e);
    console.dir(e);
    process.exit(1);
  });
