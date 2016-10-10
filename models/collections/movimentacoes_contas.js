'use strict';

const Bookshelf = require('../../database');
const MovimentacaoConta = Bookshelf.model('MovimentacaoConta');


var MovimentacoesConta = Bookshelf.Collection.extend({
  model: MovimentacaoConta
}, {
  listarMovimentacaoUsuario: function(id) {
    return new this()
      .query(function(qb) {
        qb
          .innerJoin('usuario', 'usuario.conta_id', 'movimentacao_conta.id')
          .where('usuario.id', id)
          .select('movimentacao_conta.*');
      })
      .fetch();
  }

});
Bookshelf.collection('MovimentacoesConta', MovimentacoesConta);

module.exports = MovimentacoesConta;
