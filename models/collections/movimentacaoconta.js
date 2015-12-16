'use strict';

var Bookshelf = require('bookshelf').conexaoMain;
var MovimentacaoConta = require("../models/movimentacaoconta");
var moment = require('moment');


var MovimentacaoContaCollection = Bookshelf.Collection.extend({
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
            console.log('sql' + qb);
            }).fetch()
                .then(function(collection) {
            return collection;
        });
    },

});

module.exports = MovimentacaoContaCollection;