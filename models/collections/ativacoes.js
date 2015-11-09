var Bookshelf = require('bookshelf').conexaoMain;
var Ativacao = require('../models/ativacao');
var _ = require('lodash');
var moment = require('moment');
var AtivacaoCollection = Bookshelf.Collection.extend({
    model: Ativacao,
}, {

    _listarAtivacoes: function(func) {


        return AtivacaoCollection.forge().query(function(qb) {
            qb
                .innerJoin('veiculo', function() {
                    this.on('veiculo.id_veiculo', '=', 'ativacao.veiculo_id');
                })
                .leftJoin('fiscalizacao', function() {
                    this.on('fiscalizacao.veiculo_id', '!=', 'ativacao.veiculo_id');
                })
                .where('ativacao.data_ativacao', '>=', moment().subtract(2, 'minutes').calendar())
                .select('ativacao.*')
                .select('veiculo.*');
            console.log('sql' + qb);
        }).fetch().then(function(collectionVeiculosSomenteAtivados) {

            return collectionVeiculosSomenteAtivados;
        });
    },

    _listarAtivacoesExpirando: function(func) {


        return AtivacaoCollection.forge().query(function(qb) {
            qb
                .innerJoin('veiculo', function() {
                    this.on('veiculo.id_veiculo', '=', 'ativacao.veiculo_id');
                })
                .leftJoin('fiscalizacao', function() {
                    this.on('fiscalizacao.veiculo_id', '!=', 'ativacao.veiculo_id');
                })
                .where('ativacao.data_ativacao', '<=', moment().subtract(2, 'minutes').calendar())
                .andWhere('ativacao.data_ativacao','>=',moment().subtract(4, 'minutes').calendar())
                .select('ativacao.*')
                .select('veiculo.*');
            console.log('sql' + qb);
        }).fetch().then(function(collectionVeiculosSomenteAtivados) {

            return collectionVeiculosSomenteAtivados;
        });
    },

    _listarAtivacoesExpiraram: function(func) {


        return AtivacaoCollection.forge().query(function(qb) {
            qb
                .innerJoin('veiculo', function() {
                    this.on('veiculo.id_veiculo', '=', 'ativacao.veiculo_id');
                })
                .leftJoin('fiscalizacao', function() {
                    this.on('fiscalizacao.veiculo_id', '!=', 'ativacao.veiculo_id');
                })
                .where('ativacao.data_ativacao', '<=', moment().subtract(5, 'minutes').calendar())
                .andWhere('ativacao.data_ativacao','>=',moment().subtract(6, 'minutes').calendar())
                .select('ativacao.*')
                .select('veiculo.*');
            console.log('sql' + qb);
        }).fetch().then(function(collectionVeiculosSomenteAtivados) {

            return collectionVeiculosSomenteAtivados;
        });
    },



});


module.exports = AtivacaoCollection;