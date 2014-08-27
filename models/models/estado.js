var Bookshelf = require('bookshelf').conexaoMain;

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
  state.save().then(function(model, err){
        if(err){
           return fail(false);
        } else {
             console.log(model);
             return then(true);
        }
  })
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