'use strict';

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const MovimentacaoConta = Bookshelf.model('MovimentacaoConta');
var moment = require('moment');


var MovimentacoesConta = Bookshelf.Collection.extend({
    model: MovimentacaoConta,
}, {

     listarMovimentacaoUsuario: function(id) {

        return  this
                .forge()
                .query(function(qb) {
                    qb
                .innerJoin('usuario', function() {
                    this.on('usuario.pessoa_id', '=', 'movimentacao_conta.pessoa_id');
                })
                .where('usuario.pessoa_id', '=', id)
                .select('movimentacao_conta.*');
            }).fetch()
                .then(function(collection) {
            return collection;
        });
    },

});
Bookshelf.collection('MovimentacoesConta', MovimentacoesConta);

module.exports = MovimentacoesConta;
