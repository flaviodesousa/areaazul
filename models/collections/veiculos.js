'use strict';


const moment = require('moment');
const Bookshelf = require('../../database');
const Veiculo = Bookshelf.model('Veiculo');

var Veiculos = Bookshelf.Collection.extend({
  model: Veiculo
}, {

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
