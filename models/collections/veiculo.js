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

            return Ativacoes._listarAtivacoesExpirando()
                .then(function(collectionVeiculosSomenteFiscalizados) {

                    arrayCampos["expirando"] = collectionVeiculosSomenteFiscalizados;
                    return arrayCampos;

                })

        }).then(function(arrayCampos) {

            return Ativacoes._listarAtivacoesExpiraram()
                .then(function(collectionVeiculosTolerancia) {

                    arrayCampos["expirou"] = collectionVeiculosTolerancia;
                    func(arrayCampos);
                     })
                });
    },

    _listarVeiculosIrregulares: function(func) {

        return VeiculoCollection.forge().query(function(qb) {
            var data = new Date();
            qb
                .innerJoin('fiscalizacao', function() {
                    this.on('fiscalizacao.placa', '!=', 'veiculo.placa');
                })
                .leftJoin('ativacao', function() {
                    this.on('ativacao.veiculo_id', '!=', 'fiscalizacao.veiculo_id');
                })
                .where('fiscalizacao.timestamp', '>', moment().subtract(75, 'minutes').calendar())
/*                and "ativacao"."data_ativacao" > moment().subtract(120, 'minutes').calendar()*/
                .select('veiculo.*')
                .select('fiscalizacao.*');
        }).fetch().then(function(collection) {
            return collection;
        });
    },



});


module.exports = VeiculoCollection;