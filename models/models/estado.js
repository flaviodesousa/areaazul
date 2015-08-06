var Bookshelf = require('bookshelf').conexaoMain;
var validator = require('validator');
var util = require('./util');



var EstadoCollection =  Bookshelf.Collection.extend({
  model: Estado
});


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
              uf: state.uf,
              ativo: 'true'
            })
            .save()
        .then(function(estado) {
          return estado;
      });

},

});

module.exports = Estado;


exports.listar = function(func) {
  EstadoCollection.forge().query(function(qb) {
    qb.select('estado.*')
  }).fetch().then(function(collection) {
    util.log(collection.models);
    func(collection);
  }); 
}

exports.validate = function(state) {
  var message = [];
  if (validator.isNull(state.nome) == true || state.nome == '') {
    message.push({attribute: 'placa', problem: "Nome é obrigatório!"});
  }
  if (validator.isNull(state.uf) == true || state.uf == '') {
    message.push({attribute: 'placa', problem: "Uf é obrigatório!"});
  }
  return message;
}