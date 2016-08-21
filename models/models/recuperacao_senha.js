'use strict';

var _ = require('lodash');
var util = require('../../helpers/util');

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;

var RecuperacaoSenha = Bookshelf.Model.extend({
  tableName: 'recuperacao_senha'
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
  procurar: function(passwordRecovery, then, fail) {
    new this()
      .query(function(qb) {
        qb
          .join('pessoa', 'pessoa.id', 'recuperacao_senha.pessoa_fisica_id')
          .join('usuario_revendedor','usuario_revendedor.pessoa_fisica_id',
            'pessoa.id')
          .where('recuperacao_senha.id', passwordRecovery.id)
          .select('recuperacao_senha.*', 'pessoa.*','usuario_revendedor.*');
      })
      .fetch()
      .then(function(model) {
        if (model) {
          then(model);
        } else {
          throw new Error('Não encontrado!');
        }
      })
      .catch(function(err) {
        fail(err);
      });
  }
});
Bookshelf.model('RecuperacaoSenha', RecuperacaoSenha);

module.exports = RecuperacaoSenha;
