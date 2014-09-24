var Bookshelf = require('bookshelf').conexaoMain;
var validator = require('validator');
var validation = require('./validation');



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
  console.log(validator.isNumeric(vehicle.attributes.ano_modelo));
  if(this.validate(vehicle) == true){
    console.log(vehicle.attributes.placa);
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
        console.log("Veiculo já existe");
        fail(false);
      }
      if(err){
         console.log(err);
         fail(false);
      }
    })
  }else{
    console.log("Campos obrigatorios não foram preenchidos");
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
             console.log(model);l
        }
  });
  });
}


exports.validate = function(vehicle){

  if(validator.isNull(vehicle.attributes.estado_id) == true || vehicle.attributes.estado_id == ''){
    console.log("Estado é  obrigatório!");
    return false;
  }
    if(validator.isNull(vehicle.attributes.placa) == true || vehicle.attributes.placa == ''){
    console.log("Placa é  obrigatório!");
    return false;
  }
  if(validator.isNull(vehicle.attributes.modelo) == true || vehicle.attributes.modelo == ''){
    console.log("Modelo é  obrigatório!");
    return false;
  }
  if(validator.isNull(vehicle.attributes.marca) == true || vehicle.attributes.modelo == ''){
    console.log("Modelo é  obrigatório!");
    return false;
  }
  if(validator.isNull(vehicle.attributes.cor) == true || vehicle.attributes.cor == ''){
    console.log("Cor é  obrigatório!");
    return false;
  }
  if(validator.isNull(vehicle.attributes.ano_fabricado) == true || vehicle.attributes.ano_fabricado == ''){
    console.log("Ano de fabricação é  obrigatório!");
    return false;
  }

  if(validator.isNull(vehicle.attributes.ano_modelo) == true || vehicle.attributes.ano_modelo == ''){
    console.log("Ano do modelo é  obrigatório!");
    return false;
  }
  if(validator.isNumeric(vehicle.attributes.ano_fabricado) == false){
    console.log("Campo invalido!");
    return false;
  }
   if(validator.isNumeric(vehicle.attributes.ano_modelo) == false){
    console.log("Campo invalido!");
    return false;
  }
  if(validation.validaPlaca(vehicle) == false){
    console.log("Placa invalida!");
    return false;
  }
  return true;
}


