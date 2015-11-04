'use strict';

var Bookshelf = require('bookshelf').conexaoMain;
var Veiculo = require('../models/veiculo');


var VeiculoCollection = Bookshelf.Collection.extend({
    model: Veiculo,
}, {

    procurar: function(vehicle, then, fail) {
        Veiculo
            .forge()
            .query(function(qb) {
                qb.where('veiculo.id_veiculo', vehicle.id_veiculo);
                qb.join('cidade', 'cidade.id_cidade', '=', 'veiculo.cidade_id');
                qb.select('veiculo.*');
                qb.select('cidade.*');
            })
            .fetch()
            .then(function(collection) {
                then(collection);
            })
            .catch(function(err) {
                fail(err);
            });
    },

    listar: function(func) {
        VeiculoCollection.forge().query(function(qb) {
            qb
            .innerJoin('veiculo', function() {
              this.on('veiculo.id_veiculo', '=','ativacao.veiculo_id');
            })
            .leftJoin('fiscalizacao', function() {
              this.on('fiscalizacao.veiculo_id', '!=', 'ativacao.veiculo_id');
            })

            .select('ativacao.*')
            .select('veiculo.*')
            .select('fiscalizacao.*');
            console.log('sql' + qb);
        }).fetch().then(function(collection) {
          console.dir(collection);
            func(collection);
        });
    },


});


module.exports = VeiculoCollection;