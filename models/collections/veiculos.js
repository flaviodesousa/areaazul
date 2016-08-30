'use strict';

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const Veiculo = Bookshelf.model('Veiculo');
const Ativacoes = Bookshelf.collection('Ativacoes');
const Fiscalizacoes = Bookshelf.collection('Fiscalizacoes');
var _ = require('lodash');

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
      }).catch(function(err) {
        fail(err);
      });
  },

  listar: function(func) {
    var arrayCampos = new Array();
    var i = null;
    var person = new Object();
    return Ativacoes
      ._listarAtivacoes()
      .then(function(collectionVeiculosSomenteAtivados) {
        arrayCampos['ativo'] = collectionVeiculosSomenteAtivados;
        return arrayCampos;
      })
      .then(function(arrayCampos) {
        return Ativacoes
          ._listarAtivacoesExpirando()
          .then(function(collectionVeiculosSomenteFiscalizados) {
            arrayCampos['expirando'] = collectionVeiculosSomenteFiscalizados;
            return arrayCampos;
          })
    }).then(function(arrayCampos) {

        return Ativacoes._listarAtivacoesExpiraram()
            .then(function(collectionVeiculosTolerancia) {

                arrayCampos['expirou'] = collectionVeiculosTolerancia;
                func(arrayCampos);
                 })
            });
  },

    _listarVeiculosIrregulares: function(func) {

        return Veiculos.forge().query(function(qb) {
            var data = new Date();
            qb
                .innerJoin('fiscalizacao', function() {
                    this.on('fiscalizacao.placa', '!=', 'veiculo.placa');
                })
                .leftJoin('ativacao', function() {
                    this.on('ativacao.veiculo_id', '!=', 'fiscalizacao.veiculo_id');
                })
                .where('fiscalizacao.timestamp', '>', moment().subtract(75, 'minutes').calendar())
/*                and 'ativacao'.'data_ativacao' > moment().subtract(120, 'minutes').calendar()*/
                .select('veiculo.*')
                .select('fiscalizacao.*');
        }).fetch().then(function(collection) {
            return collection;
        });
    },



});
Bookshelf.collection('Veiculos', Veiculos);

module.exports = Veiculos;
