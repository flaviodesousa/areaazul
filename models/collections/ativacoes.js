var Bookshelf = require('bookshelf').conexaoMain;
var Ativacao = require('../models/ativacao');
var _ = require('lodash');

var AtivacaoCollection = Bookshelf.Collection.extend({
    model: Ativacao,
},{

  _listarAtivacoes: function(func) {


        return AtivacaoCollection.forge().query(function(qb) {
                qb
                    .innerJoin('veiculo', function() {
                        this.on('veiculo.id_veiculo', '=', 'ativacao.veiculo_id');
                    })
                    .leftJoin('fiscalizacao', function() {
                        this.on('fiscalizacao.veiculo_id', '!=', 'ativacao.veiculo_id');
                    })

                    .select('ativacao.*')
                    .select('veiculo.*');
                console.log('sql' + qb);
            }).fetch().then(function(collectionVeiculosSomenteAtivados) {

                return collectionVeiculosSomenteAtivados;
            });
    },

    _listaTodos: function(func) {
        AtivacaoCollection.forge().query(function(qb) {
            qb.select('ativacao.*')
        }).fetch().then(function(collection) {
            return collection;
        });
    },

});


module.exports = AtivacaoCollection;
