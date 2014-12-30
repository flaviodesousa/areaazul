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

exports.cadastrar = function(state, fail, then){
  var estado = new this.Estado({
       'nome': state.nome,
       'uf': state.uf,
       'ativo': 'true'
  });
    new this.Estado({
         nome : state.nome,
    }).fetch().then(function(model){
      console.log("12"+model);
      if(model == null){
           estado.save().then(function(model, err){
            if(err){
              fail(false);
            } else {
              util.log(model);
              then(true);
            }
          })

      }else{
          util.log("Estado já existe!");
          fail(false);
      }
    }) 
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
exports.desativar = function(state, fail, then){
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


exports.validate = function(state){
    if(validator.isNull(state.nome) == true || state.nome == ''){
      util.log("Nome é  obrigatório!");
      return false;
    }
    if(validator.isNull(state.uf) == true || state.uf == ''){
      util.log("Uf é  obrigatório!");
      return false;
    }
    return true;
}