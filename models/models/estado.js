'use strict';

var Bookshelf = require('bookshelf').conexaoMain;
var util = require('./util');


var Estado = Bookshelf.Model.extend({
  tableName: 'estado',
  idAttribute: 'id_estado',


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

module.exports = Estado;


