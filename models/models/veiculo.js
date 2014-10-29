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

  var vehicle = new this.Veiculo({
       'estado_id': vehicle.estado_id,
       'placa': vehicle.placa,
       'marca': vehicle.marca,
       'modelo': vehicle.modelo,
       'cor': vehicle.cor,
       'ano_fabricado': vehicle.ano_fabricado,
       'ano_modelo': vehicle.ano_modelo,
       'ativo': 'true'
  });
  util.log(validator.isNumeric(vehicle.attributes.ano_modelo));
  if(this.validate(vehicle) == true){
    util.log(vehicle.attributes.placa);
    new this.Veiculo({
      'placa' : vehicle.attributes.placa
    }).fetch().then(function(result, err){
      if (result == null) {
      vehicle.save().then(function(model, err){
          if(err){
            fail(false);
          } else {
            then(true);
          }
        });
      }else{
        util.log("Veiculo já existe");
        fail(false);
      }
      if(err){
         util.log(err);
         fail(false);
      }
    })
  }else{
    util.log("Campos obrigatorios não foram preenchidos");
     fail(false);
  }
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
           return fail(false);
        } else {
             util.log(model);
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
             util.log(model);l
        }
  });
  });
}


exports.validate = function(vehicle){

  if(validator.isNull(vehicle.attributes.estado_id) == true || vehicle.attributes.estado_id == ''){
    util.log("Estado é  obrigatório!");
    return false;
  }
    if(validator.isNull(vehicle.attributes.placa) == true || vehicle.attributes.placa == ''){
    util.log("Placa é  obrigatório!");
    return false;
  }
  if(validator.isNull(vehicle.attributes.modelo) == true || vehicle.attributes.modelo == ''){
    util.log("Modelo é  obrigatório!");
    return false;
  }
  if(validator.isNull(vehicle.attributes.marca) == true || vehicle.attributes.modelo == ''){
    util.log("Modelo é  obrigatório!");
    return false;
  }
  if(validator.isNull(vehicle.attributes.cor) == true || vehicle.attributes.cor == ''){
    util.log("Cor é  obrigatório!");
    return false;
  }
  if(validator.isNull(vehicle.attributes.ano_fabricado) == true || vehicle.attributes.ano_fabricado == ''){
    util.log("Ano de fabricação é  obrigatório!");
    return false;
  }

  if(validator.isNull(vehicle.attributes.ano_modelo) == true || vehicle.attributes.ano_modelo == ''){
    util.log("Ano do modelo é  obrigatório!");
    return false;
  }
  if(validator.isNumeric(vehicle.attributes.ano_fabricado) == false){
    util.log("Campo invalido!");
    return false;
  }
   if(validator.isNumeric(vehicle.attributes.ano_modelo) == false){
    util.log("Campo invalido!");
    return false;
  }
  if(validation.validaPlaca(vehicle) == false){
    util.log("Placa invalida!");
    return false;
  }
  return true;
}


