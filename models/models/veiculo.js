var Bookshelf = require('bookshelf').conexaoMain;

var Veiculo = Bookshelf.Model.extend({
    tableName: 'veiculo',
    idAttribute: 'id_veiculo'
});


exports.Veiculo = Veiculo;


var VeiculoCollection =  Bookshelf.Collection.extend({
    model: Veiculo
});

exports.cadastrar = function(vehicle, fail, then){

  var vehicle = new this.Veiculo({
       'estado_id': vehicle.estado_id,
       'placa': vehicle.placa,
       'placa_numero': vehicle.placa_numero,
       'marca': vehicle.marca,
       'modelo': vehicle.modelo,
       'cor': vehicle.cor,
       'ano_fabricado': vehicle.ano_fabricado,
       'ano_modelo': vehicle.ano_modelo,
       'ativo': 'true'
  });
  console.log(vehicle);
  vehicle.save().then(function(model, err){
        if(err){
          return fail(false);
        } else {
          return then(true)
        }
  })
}

exports.listar = function(func)
 {
    VeiculoCollection.forge().query(function(qb){
         qb.join('estado', 'estado.id_estado','=','veiculo.estado_id');
         qb.select('veiculo.*');
         qb.select('estado.*');
    }).fetch().then(function(collection) {
        console.log(collection.models);
        func(collection);
    }); 
}

exports.procurar = function(vehicle, func){
     Veiculo.forge().query(function(qb){
        qb.where('veiculo.id_veiculo', vehicle.id_veiculo);
        qb.join('estado', 'estado.id_estado','=','veiculo.estado_id');
        qb.select('veiculo.*');
        qb.select('estado.*');
    }).fetch().then(function(model) {
        console.log(model);
        func(model);
    });
}

exports.editar = function(vehicle, fail, then){
  new this.Veiculo({
       id_veiculo : vehicle.id_veiculo,
  }).fetch().then(function(model){
    model.save(vehicle).then(function(model, err){
      if(err){
           return fail(false);
        } else {
             console.log(model);
           return then(true);
        }

    });

  });
}
exports.desativar = function(vehicle, fail, then){
  new this.Veiculo({
       id_veiculo : vehicle.id_veiculo,
  }).fetch().then(function(model){
    model.save(vehicle).then(function(model, err){
      if(err){
          return fail(false);
        } else {
             console.log(model);
          return then(true);
        }
    });

  });
}
