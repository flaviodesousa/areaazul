var Bookshelf = require('bookshelf').conexaoMain;
var validator = require('validator');
var validation = require('./validation');
var util = require('./util');


var Veiculo = Bookshelf.Model.extend({
    tableName: 'veiculo',
    idAttribute: 'id_veiculo'
});


exports.Veiculo = Veiculo;


var VeiculoCollection =  Bookshelf.Collection.extend({
    model: Veiculo
});

exports.cadastrar = function(vehicle, fail, then){
    var veiculo = new this.Veiculo({
         'estado_id': vehicle.estado_id,
         'placa': vehicle.placa,
         'marca': vehicle.marca,
         'modelo': vehicle.modelo,
         'cor': vehicle.cor,
         'ano_fabricado': vehicle.ano_fabricado,
         'ano_modelo': vehicle.ano_modelo,
         'ativo': 'true'
    });
  
    new this.Veiculo({
      'placa' : vehicle.placa
    }).fetch().then(function(result){
      if (result == null) {
           veiculo.save().then(function(model){
           then(true);
        });
      }else{
        util.log("Veiculo já existe");
        fail(false);
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
        util.log(collection.models);
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
        util.log(model);
        func(model);
    });
}

exports.editar = function(vehicle, fail, then){
  new this.Veiculo({
       id_veiculo : vehicle.id_veiculo,
  }).fetch().then(function(model){
    model.save(vehicle).then(function(model, err){
      if(err){
          fail(false);
        } else {
          util.log(model);
          then(true);
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
          fail(false);
        } else {
             util.log(model);
        }
  });
  });
}


exports.validate = function(vehicle){

  if(validator.isNull(vehicle.estado_id) == true || vehicle.estado_id == ''){
    util.log("Estado é  obrigatório!");
    return false;
  }
    if(validator.isNull(vehicle.placa) == true || vehicle.placa == ''){
    util.log("Placa é  obrigatório!");
    return false;
  }
  if(validator.isNull(vehicle.modelo) == true || vehicle.modelo == ''){
    util.log("Modelo é  obrigatório!");
    return false;
  }
  if(validator.isNull(vehicle.marca) == true || vehicle.modelo == ''){
    util.log("Modelo é  obrigatório!");
    return false;
  }
  if(validator.isNull(vehicle.cor) == true || vehicle.cor == ''){
    util.log("Cor é  obrigatório!");
    return false;
  }
  if(validator.isNull(vehicle.ano_fabricado) == true || vehicle.ano_fabricado == ''){
    util.log("Ano de fabricação é  obrigatório!");
    return false;
  }

  if(validator.isNull(vehicle.ano_modelo) == true || vehicle.ano_modelo == ''){
    util.log("Ano do modelo é  obrigatório!");
    return false;
  }
  if(validator.isNumeric(vehicle.ano_fabricado) == false){
    util.log("Campo invalido!");
    return false;
  }
   if(validator.isNumeric(vehicle.ano_modelo) == false){
    util.log("Campo invalido!");
    return false;
  }
  if(validation.validaPlaca(vehicle) == false){
    util.log("Placa invalida!");
    return false;
  }
  return true;
}


