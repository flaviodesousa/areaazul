'use strict';

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
var Fiscalizacao = Bookshelf.model('Fiscalizacao');
var moment = require('moment');

var Fiscalizacoes = Bookshelf.Collection.extend({
    model: Fiscalizacao,
}, {

    listar: function(parameters, then, fail) {
        this
            .query(function(qb) {
                var params = parameters || {};
                if (params.minutos) {
                    qb.where('timestamp', '>=',
                        moment().subtract(params.minutos, 'minutes')
                        .calendar());
                }
                if (params.limite) {
                    qb.limit(params.limite);
                }
                qb.orderBy('timestamp', 'desc');
            })
            .fetch()
            .then(function(c) {
                then(c);
            })
            .catch(function(err) {
                fail(err);
            });
    },

    _listarFiscalizacoes: function(func) {


        return Fiscalizacoes.forge().query(function(qb) {
            var data = new Date();
            qb
                .innerJoin('veiculo', function() {
                    this.on('veiculo.placa', '=', 'fiscalizacao.placa');
                })
                .leftJoin('ativacao', function() {
                    this.on('ativacao.veiculo_id', '!=', 'fiscalizacao.veiculo_id');
                })
                .where('fiscalizacao.timestamp', '>', moment().subtract(60, 'minutes').calendar())
                .select('veiculo.*')
                .select('fiscalizacao.*');
        }).fetch().then(function(collectionVeiculosSomenteFiscalizados) {

            return collectionVeiculosSomenteFiscalizados;
        });
    },

    _listarFiscalizacoesToleradas: function(func) {


        return Fiscalizacoes.forge().query(function(qb) {
            var data = new Date();
            qb
                .innerJoin('veiculo', function() {
                    this.on('veiculo.placa', '=', 'fiscalizacao.placa');
                })
                .leftJoin('ativacao', function() {
                    this.on('ativacao.veiculo_id', '!=', 'fiscalizacao.veiculo_id');
                })
                .whereBetween('fiscalizacao.timestamp', [moment().subtract(61, 'minutes').calendar(), moment().subtract(75, 'minutes').calendar()])
                .select('veiculo.*')
                .select('fiscalizacao.*');

            console.log('sql' + qb);

        }).fetch().then(function(collection) {
            return collection;
        });
    },



});
Bookshelf.collection('Fiscalizacoes', Fiscalizacoes);

module.exports = Fiscalizacoes;
