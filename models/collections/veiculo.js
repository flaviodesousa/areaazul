'use strict';

var Bookshelf = require('bookshelf').conexaoMain;
var Veiculo = require('../models/veiculo');
var Ativacoes = require('../collections/ativacoes');
var Fiscalizacoes = require('../collections/fiscalizacoes');
var Veiculos = require('../collections/veiculo');
var _ = require('lodash');

var VeiculoCollection = Bookshelf.Collection.extend({
    model: Veiculo,
}, {

    procurar: function(vehicle, then, fail) {
        Veiculo.forge().query(function(qb) {
            qb.where('veiculo.id_veiculo', vehicle.id_veiculo);
            qb.join('cidade', 'cidade.id_cidade', '=', 'veiculo.cidade_id');
            qb.select('veiculo.*');
            qb.select('cidade.*');
        }).fetch().then(function(collection) {
            then(collection);
        }).catch(function(err) {
            fail(err);
        });
    },

    listar: function(func) {
        var arrayCampos = new Array();
        var i = null;
        var person = new Object();
        return Ativacoes._listarAtivacoes().
        then(function(collectionVeiculosSomenteAtivados) {

            arrayCampos["ativo"] = collectionVeiculosSomenteAtivados;
            return arrayCampos;

        }).then(function(arrayCampos) {

            return Fiscalizacoes._listarFiscalizacoes()
                .then(function(collectionVeiculosSomenteFiscalizados) {

                    arrayCampos["fiscalizado"] = collectionVeiculosSomenteFiscalizados;
                    return arrayCampos;

                })

        }).then(function(arrayCampos) {

            return Fiscalizacoes._listarFiscalizacoesToleradas()
                .then(function(collectionVeiculosTolerancia) {

                    arrayCampos["tolerancia"] = collectionVeiculosTolerancia;
                    func(arrayCampos);
                    console.log("-------------------------------------");
                    console.dir(arrayCampos);
                     })
                });
    },

    _listaTodos: function(func) {
        VeiculoCollection.forge().query(function(qb) {
            qb.select('veiculo.*')
        }).fetch().then(function(collection) {
            return collection;
        });
    },


});


module.exports = VeiculoCollection;