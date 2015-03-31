var Bookshelf = require('bookshelf').conexaoMain;
var validator = require('validator');
var validation = require('./validation');
var util = require('./util');
var Usuario_has_Veiculo = require('./usuario_has_veiculo');


var Veiculo = Bookshelf.Model.extend({
    tableName: 'veiculo',
    idAttribute: 'id_veiculo'
});


exports.Veiculo = Veiculo;


var VeiculoCollection =  Bookshelf.Collection.extend({
    model: Veiculo
});


exports.cadastrar  = function(vehicle, then, fail){



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

        var usuario_has_veiculo = new Usuario_has_Veiculo.Usuario_has_Veiculo({
            'usuario_id' : vehicle.usuario_id
        });

        Bookshelf.transaction(function(t) {
            veiculo.save(null, {
                transacting: t
            }).
            then(function(veiculo) {
                usuario_has_veiculo.save({
                    veiculo_id: veiculo.id,
                }, {
                    transacting: t
                }).then(function(model) {
                        t.commit();
                        console.log("commit");
                        then(model);
                    }).catch(function(err) {
                        t.rollback();
                        util.log("rollback"+err);
                        fail(err);
                    });
          });
        }).catch(function(err) {
            util.log("Ocorreu erro!");
            fail(err);
        });


}

exports.listar = function(then, fail)
 {
    VeiculoCollection.forge().query(function(qb){
         qb.join('estado', 'estado.id_estado','=','veiculo.estado_id');
         qb.select('veiculo.*');
         qb.select('estado.*');
    }).fetch().then(function(collection) {
             util.log("Sucesso!");
             then(collection);
    }).catch(function(err) {
            console.log(err);
            util.log("Ocorreu erro!");
            fail(err);
    });

}

exports.listarVeiculosUsuario = function(user, then, fail)
 {
    VeiculoCollection.forge().query(function(qb){
        qb.where('usuario_has_veiculo.usuario_id', user.id_usuario);
        qb.join('estado', 'estado.id_estado','=','veiculo.estado_id');
        qb.join('usuario_has_veiculo', 'veiculo.id_veiculo','=','usuario_has_veiculo.veiculo_id');
        qb.select('veiculo.*');
        qb.select('estado.*');
       console.log('sql'+qb);
    }).fetch().then(function(collection) {
         util.log("Sucesso!");
         then(collection);
    }).catch(function(err) {
        console.log(err);
        util.log("Ocorreu erro!");
        fail(err);
    });

}


exports.procurar = function(vehicle, then, fail){
     Veiculo.forge().query(function(qb){
        qb.where('veiculo.id_veiculo', vehicle.id_veiculo);
        qb.join('estado', 'estado.id_estado','=','veiculo.estado_id');
        qb.select('veiculo.*');
        qb.select('estado.*');
    }).fetch().then(function(collection) {
         then(collection);
    }).catch(function(err) {
        fail(err);
    });
}

exports.editar = function(vehicle, then, fail){
  new this.Veiculo({
       id_veiculo : vehicle.id_veiculo,
  }).fetch().then(function(model){
    model.save(vehicle).then(function(model) {
         util.log("Sucesso!");
         then(model);
    }).catch(function(err) {
        console.log(err);
        util.log("Ocorreu erro!");
        fail(err);
    });
  });
}

exports.procurarVeiculoPorPlaca = function(vehicle, then, fail){
     Veiculo.forge().query(function(qb){
        qb.where('veiculo.placa', vehicle.placa);
     //   qb.join('estado', 'estado.id_estado','=','veiculo.estado_id');
        qb.select('veiculo.*');
       // qb.select('estado.*');
        console.log("sql: "+qb);
    }).fetch().then(function(model) {
      console.log("passei aq");
         then(model);
    }).catch(function(err) {
      console.log("err"+err);
        fail(err);
    });

}


exports.desativar = function(vehicle, then, fail){
  new this.Veiculo({
       id_veiculo : vehicle.id_veiculo,
  }).fetch().then(function(model){
    model.save(vehicle).then(function(model) {
         util.log("Sucesso!");
         then(model);
    }).catch(function(err) {
        console.log(err);
        util.log("Ocorreu erro!");
        fail(err);
    });
  });
}

exports.validate = function(vehicle){
  var message = [];
  if(validator.isNull(vehicle.estado_id) == true || vehicle.estado_id == ''){
      message.push({attribute : 'estado', problem : "Estado é obrigatório!"});
  }
  if(validator.isNull(vehicle.placa) == true || vehicle.placa == ''){
      message.push({attribute : 'placa', problem : "Estado é obrigatório!"});
  }
  if(validator.isNull(vehicle.modelo) == true || vehicle.modelo == ''){
      message.push({attribute : 'modelo', problem : "Modelo é obrigatório!"});
  }
  if(validator.isNull(vehicle.marca) == true || vehicle.modelo == ''){
      message.push({attribute : 'marca', problem : "Marca é obrigatório!"});
  }
  if(validator.isNull(vehicle.cor) == true || vehicle.cor == ''){
      message.push({attribute : 'cor', problem : "Cor é obrigatório!"});
  }
  if(validator.isNull(vehicle.ano_fabricado) == true || vehicle.ano_fabricado == ''){
      message.push({attribute : 'ano_fabricado', problem : "Ano de fabricação é obrigatório!"});
  }
  if(validator.isNull(vehicle.ano_modelo) == true || vehicle.ano_modelo == ''){
      message.push({attribute : 'ano_modelo', problem : "Ano de modelo é obrigatório!"});
  }
  if(validator.isNumeric(vehicle.ano_fabricado) == false){
      message.push({attribute : 'ano_fabricado', problem : "Ano de fabricação é inválido!"});
  }
  if(validator.isNumeric(vehicle.ano_modelo) == false){
      message.push({attribute : 'ano_modelo', problem : "Ano de modelo é inválido!"});
  }
  if(validation.validaPlaca(vehicle) == false){
      message.push({attribute : 'placa', problem : "Placa é inválida!"});
  }
  return true;
}
