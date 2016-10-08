'use strict';


const moment = require('moment');
const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const Veiculo = Bookshelf.model('Veiculo');
const Ativacoes = Bookshelf.collection('Ativacoes');

var Veiculos = Bookshelf.Collection.extend({
  model: Veiculo
}, {
  procurar: function(vehicle, then, fail) {
    Veiculo
      .forge()
      .query(function(qb) {
        qb
          .where('veiculo.id', vehicle.id)
          .join('cidade', 'cidade.id', 'veiculo.id')
          .select('veiculo.*')
          .select('cidade.*');
      })
      .fetch()
      .then(function(collection) {
        then(collection);
      })
      .catch(function(err) {
        fail(err);
      });
  },

  listar: function() {
    var veiculos = {};
    return Ativacoes
      ._listarAtivacoes()
      .then(function(ativacoes) {
        veiculos.ativos = ativacoes;
      })
      .then(function() {
        return Ativacoes
          ._listarAtivacoesExpirando();
      })
      .then(function(ativacoesExpirando) {
        veiculos.expirando = ativacoesExpirando;
      })
      .then(function() {
        return Ativacoes
          ._listarAtivacoesExpiraram();
      })
      .then(function(ativacoesExpiradas) {
        veiculos.expirados = ativacoesExpiradas;
      })
      .then(() => {
        return veiculos;
      });
  },

  _listarVeiculosIrregulares: function() {
    return Veiculos.forge()
      .query(function(qb) {
        qb
          .innerJoin('fiscalizacao', function() {
            this.on('fiscalizacao.placa', '!=', 'veiculo.placa');
          })
          .leftJoin('ativacao', function() {
            this.on('ativacao.veiculo_id', '!=', 'fiscalizacao.veiculo_id');
          })
          .where('fiscalizacao.timestamp', '>', moment()
            .subtract(75, 'minutes')
            .calendar())
          .select('veiculo.*')
          .select('fiscalizacao.*');
      })
      .fetch();
  }
});
Bookshelf.collection('Veiculos', Veiculos);

module.exports = Veiculos;
