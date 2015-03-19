var Bookshelf = require('bookshelf').conexaoMain;
var validator = require('validator');
var util = require('./util');

var Estado = Bookshelf.Model.extend({
    tableName: 'estado',
    idAttribute: 'id_estado'
});

var EstadoCollection =  Bookshelf.Collection.extend({
    model: Estado
});

exports.Estado = Estado;

exports.cadastrar = function(state, then, fail){
  var estado = new this.Estado({
       'nome': state.nome,
       'uf': state.uf,
       'ativo': 'true'
   });
   estado.save().then(function(model){
            then(model);
   }).catch(function(err){
            fail(err);
   });
}

exports.listar = function(func)
{
    EstadoCollection.forge().query(function(qb){
         qb.select('estado.*')
    }).fetch().then(function(collection) {
        util.log(collection.models);
        func(collection);
    }); 
}

exports.procurar = function(state, func){
     Estado.forge().query(function(qb){
        qb.where('estado.id_estado', state.id_estado);
        qb.select('estado.*');
    }).fetch().then(function(model) {
        util.log(model);
        func(model);
    });
}

exports.editar = function(state, fail, then){
  util.log(state); 
  var estado = new this.Estado({
       'id_estado': state.id_estado,
       'nome': state.nome,
       'uf': state.uf,
       'ativo': state.ativo
  }); 
  new this.Estado({
       id_estado : state.id_estado,
  }).fetch().then(function(model){
    model.save(state).then(function(model, err){
      if(err){
           fail(false);
        } else {
           util.log(model);
           then(true);
        }

    });
  });
}
exports.desativar = function(state,then, fail){
  new this.Estado({
       id_estado : state.id_estado,
  }).fetch().then(function(model){
    model.save(state).then(function(model) {
      then(model);
    }).catch(function(err) {
    fail(err);
   });
  });
}


exports.validate = function(state){
    var message = [];
    if(validator.isNull(state.nome) == true || state.nome == ''){
        message.push({attribute : 'placa', problem : "Nome é obrigatório!"});
    }
    if(validator.isNull(state.uf) == true || state.uf == ''){
        message.push({attribute : 'placa', problem : "Uf é obrigatório!"});
    }
    return message;
}