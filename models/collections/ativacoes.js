var Bookshelf = require('bookshelf').conexaoMain;
var Ativacao = require('../models/ativacao');
var _ = require('lodash');

module.exports = Bookshelf.Collection.extend({
  model: Ativacao,
},{

	_listarAtivacoes: function() {
    return this
      .query(function(qb) {
      qb
        .innerJoin('veiculo', function() {
          this.on('veiculo.id_veiculo', '=','ativacao.veiculo_id');
        })
        .leftJoin('fiscalizacao', function() {
          this.on('fiscalizacao.veiculo_id', 'not in (', 'a.veiculo_id)');
        })

        .select('ativacao.*')
        .select('veiculo.*')
        .select('fiscalizacao.*');
      console.log('sql' + qb);
    })
      .fetch()
      .then(function(listaAtivacoes) {
      	console.log(listaAtivacoes);
        return listaAtivacoes;
      })
      .catch(function(err) {
        return err;
      });
  },



});
