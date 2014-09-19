var Bookshelf = require('bookshelf').conexaoMain;
var validator = require('validator');

var Estado = Bookshelf.Model.extend({
    tableName: 'estado',
    idAttribute: 'id_estado'
});

var EstadoCollection =  Bookshelf.Collection.extend({
    model: Estado
});

exports.Estado = Estado;

exports.cadastrar = function(state, fail, then){
  var state = new this.Estado({
       'nome': state.nome,
       'uf': state.uf,
       'ativo': 'true'
  });
  console.log(state);
  if(this.validate(state) == true){
    new this.Estado({
         nome : state.nome,
    }).fetch().then(function(model){
      if(model == null){
           state.save().then(function(model, err){
            if(err){
              fail(false);
            } else {
              console.log(model);
              then(true);
            }
          })

      }else{
          console.log("Estado já existe!");
          fail(false);
      }
    }) 
  }else{
      console.log("Campos obrigatórios!");
       fail(false);
  }
  
}

exports.listar = function(func)
{
    EstadoCollection.forge().query(function(qb){
         qb.select('estado.*')
    }).fetch().then(function(collection) {
        console.log(collection.models);
        func(collection);
    }); 
}

exports.procurar = function(state, func){
     Estado.forge().query(function(qb){
        qb.where('estado.id_estado', state.id_estado);
        qb.select('estado.*');
    }).fetch().then(function(model) {
        console.log(model);
        func(model);
    });
}

exports.editar = function(state, fail, then){
  console.log(state); 
  var estado = new this.Estado({
       'id_estado': state.id_estado,
       'nome': state.nome,
       'uf': state.uf,
       'ativo': state.ativo
  }); 

  if(this.validate(estado) == true){
  new this.Estado({
       id_estado : state.id_estado,
  }).fetch().then(function(model){
    model.save(state).then(function(model, err){
      if(err){
           fail(false);
        } else {
           console.log(model);
           then(true);
        }

    });

  });
  }else{
      console.log("Campos obrigatórios!");
      fail(false);
  }
}
exports.desativar = function(state, fail, then){
  new this.Estado({
       id_estado : state.id_estado,
  }).fetch().then(function(model){
    model.save(state).then(function(model, err){
      if(err){
          return fail(false);
        } else {
             console.log(model);
          return then(true);
        }
    });

  });
}


exports.validate = function(state){
    if(validator.isNull(state.attributes.nome) == true || state.attributes.nome == ''){
      console.log("Nome é  obrigatório!");
      return false;
    }
    if(validator.isNull(state.attributes.uf) == true || state.attributes.uf == ''){
      console.log("Uf é  obrigatório!");
      return false;
    }
    return true;
}