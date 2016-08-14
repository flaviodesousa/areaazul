'use strict';

var AreaAzul = require('../../areaazul');
var Bookshelf = AreaAzul.db.Bookshelf.conexaoMain;
var Ativacao = require('../models/ativacao');
var moment = require('moment');

var AtivacaoCollection = Bookshelf.Collection.extend({
    model: Ativacao
  }, {

  _listarAtivacoes: function() {
    return AtivacaoCollection
      .forge()
      .query(function(qb) {
        qb
          .innerJoin('veiculo', 'veiculo.id_veiculo', 'ativacao.veiculo_id')
          .leftJoin('fiscalizacao',
            'fiscalizacao.veiculo_id', 'ativacao.veiculo_id')
          .where('ativacao.data_ativacao', '>=',
            moment().subtract(2, 'minutes').calendar())
          .select('ativacao.*')
          .select('veiculo.*');
      }).fetch().then(function(collectionVeiculosSomenteAtivados) {
        return collectionVeiculosSomenteAtivados;
      });
  },

  _listarAtivacoesExpirando: function() {
    return AtivacaoCollection
      .forge()
      .query(function(qb) {
        qb
          .innerJoin('veiculo', 'veiculo.id_veiculo', 'ativacao.veiculo_id')
          .leftJoin('fiscalizacao',
            'fiscalizacao.veiculo_id', 'ativacao.veiculo_id')
          .where('ativacao.data_ativacao', '<=',
            moment().subtract(2, 'minutes').calendar())
          .andWhere('ativacao.data_ativacao', '>=',
            moment().subtract(4, 'minutes').calendar())
          .select('ativacao.*')
          .select('veiculo.*');
      })
      .fetch()
      .then(function(collectionVeiculosSomenteAtivados) {
        return collectionVeiculosSomenteAtivados;
      });
  },

  _listarAtivacoesExpiraram: function() {
    return AtivacaoCollection
      .forge()
      .query(function(qb) {
        qb
          .innerJoin('veiculo',
            'veiculo.id_veiculo', 'ativacao.veiculo_id')
          .leftJoin('fiscalizacao',
            'fiscalizacao.veiculo_id', 'ativacao.veiculo_id')
          .where('ativacao.data_ativacao', '<=',
            moment().subtract(5, 'minutes').calendar())
          .andWhere('ativacao.data_ativacao', '>=',
            moment().subtract(6, 'minutes').calendar())
          .select('ativacao.*')
          .select('veiculo.*');
      })
      .fetch()
      .then(function(collectionVeiculosSomenteAtivados) {
        return collectionVeiculosSomenteAtivados;
      });
  }
});


module.exports = AtivacaoCollection;
