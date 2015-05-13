'use strict';

var _ = require('lodash');
var util = require('./util');

var Bookshelf = require('bookshelf').conexaoMain;

var RecuperacaoSenha = Bookshelf.Model.extend({
  tableName: 'recuperacao_senha',
  idAttribute: 'id_recuperacao_senha',
  

}, {
  cadastrar: function (password_recovery, then, fail) {
    return this.forge({
        id_recuperacao_senha: password_recovery.uuid,
        pessoa_id: password_recovery.pessoa_id,
        data_expiracao: new Date()
      }).save(null, { method: 'insert' }).then(function(model){
          then(model);
   }).catch(function(err){
        fail(err);
   });
  }
});

module.exports = RecuperacaoSenha;