'use strict';

const Bookshelf = require('../../database');

var RecuperacaoSenha = Bookshelf.Model.extend(
  {
    tableName: 'recuperacao_senha'
  }, {
    cadastrar: function(passwordRecovery) {
      return new RecuperacaoSenha({
          id: passwordRecovery.uuid,
          pessoa_id: passwordRecovery.pessoa_id,
          data_expiracao: new Date()
        })
        .save(null, { method: 'insert' });
    },
    procurar: function(passwordRecovery, then, fail) {
      new RecuperacaoSenha()
        .query(
          function(qb) {
            qb
              .join('pessoa', 'pessoa.id', 'recuperacao_senha.pessoa_fisica_id')
              .join(
                'usuario_revendedor', 'usuario_revendedor.pessoa_fisica_id',
                'pessoa.id')
              .where('recuperacao_senha.id', passwordRecovery.id)
              .select('recuperacao_senha.*',
                      'pessoa.*',
                      'usuario_revendedor.*');
          })
        .fetch()
        .then(
          function(model) {
            if (model) {
              then(model);
            } else {
              throw new Error('Não encontrado!');
            }
          })
        .catch(
          function(err) {
            fail(err);
          });
    }
  });
Bookshelf.model('RecuperacaoSenha', RecuperacaoSenha);

module.exports = RecuperacaoSenha;
