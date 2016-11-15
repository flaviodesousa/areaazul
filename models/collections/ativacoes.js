'use strict';

const moment = require('moment');

const Bookshelf = require('../../database');
const Ativacao = Bookshelf.model('Ativacao');

const Ativacoes = Bookshelf.Collection.extend({
    model: Ativacao
  }, {

  _listarAtivacoes: function() {
    return Ativacoes
      .forge()
      .query(function(qb) {
        qb
          .innerJoin('veiculo', 'veiculo.id', 'ativacao.veiculo_id')
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
    return Ativacoes
      .forge()
      .query(function(qb) {
        qb
          .innerJoin('veiculo', 'veiculo.id', 'ativacao.veiculo_id')
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
    return Ativacoes
      .forge()
      .query(function(qb) {
        qb
          .innerJoin('veiculo',
            'veiculo.id', 'ativacao.veiculo_id')
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
Bookshelf.collection('Ativacoes', Ativacoes);

module.exports = Ativacoes;
