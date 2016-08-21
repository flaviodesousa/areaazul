'use strict';

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
var util = require('../../helpers/util');

var Estado = Bookshelf.Model.extend({
  tableName: 'estado',

  procurar: function(state, func) {
    Estado.forge().query(function(qb) {
      qb.where('estado.id_estado', state.id_estado);
      qb.select('estado.*');
    }).fetch().then(function(model) {
      util.log(model);
      func(model);
    });
  }
}, {
  cadastrar: function(state) {
      return Estado
            .forge({
              nome: state.nome,
              uf: state.uf
            })
            .save()
        .then(function(estado) {
          return estado;
      });
  },

});
Bookshelf.model('Estado', Estado);

module.exports = Estado;


