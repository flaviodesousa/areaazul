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
  },
  procurar: function (password_recovery, then, fail) {
    this.forge().query(function (qb) {
      qb.join('pessoa', 'pessoa.id_pessoa', '=', 'recuperacao_senha.pessoa_id');
            qb.join('usuario_revendedor','usuario_revendedor.pessoa_fisica_pessoa_id','=','pessoa.id_pessoa');
      qb.where('recuperacao_senha.id_recuperacao_senha', '=', password_recovery.id_recuperacao_senha);
      qb.select('recuperacao_senha.*', 'pessoa.*','usuario_revendedor.*');
      console.log("sql"+qb);
    }).fetch().then(function (model) {
      if(model!==null){
          then(model);
      }else{
          throw new Error("Não encontrado!!!");
      }
    }).catch(function (err) {
      fail(err);
    });
  }
});

module.exports = RecuperacaoSenha;