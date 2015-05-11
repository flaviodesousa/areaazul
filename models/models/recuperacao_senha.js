'use strict';

var _ = require('lodash');
var util = require('./util');

var Bookshelf = require('bookshelf').conexaoMain;

var RecuperacaoSenha = Bookshelf.Model.extend({
  tableName: 'recuperacao_senha',
  idAttribute: 'id_recuperacao_senha',
  

}, {
  cadastrar: function (password_recovery, then, fail) {
    return RecuperacaoSenha.forge({
        id_recuperacao_senha: password_recovery,
        ativo: true
      }).save().then(function(model){
          then(model);
   }).catch(function(err){
        fail(err);
   });
  }
});

module.exports = RecuperacaoSenha;