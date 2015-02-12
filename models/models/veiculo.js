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


exports.cadastrar  = function(vehicle, fail, then){

        var veiculo = new this.Veiculo({
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

        var usuario_has_veiculo = new Usuario_has_Veiculo.Usuario_has_Veiculo({
            'usuario_id' : vehicle.usuario_id
        });

        console.log("usuario_has_veiculo"+usuario_has_veiculo);
        console.log("Id:"+vehicle.id);


        Bookshelf.transaction(function(t) {
            veiculo.save(null, {
                transacting: t
            }).
            then(function(veiculo) {
                console.log(veiculo.id);
                usuario_has_veiculo.save({
                    veiculo_id: veiculo.id,
                }, {
                    transacting: t
                }).then(function(model, err) {
                          util.log("Commit");
                        t.commit();
                    }),
                    function() {
                        t.rollback();
                           util.log("rollback");
                        func(false);
                    }
                });
        }).then(function(model) {
             util.log("Passei aq");
             then(true);
        }, function(error) {
            console.log(error);
            util.log("Ocorreu erro");
            fail(false);
        });

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

exports.listarVeiculosUsuario = function(user, func)
 {
      console.log('User: '+user.id_usuario);
      VeiculoCollection.forge().query(function(qb){
        qb.where('usuario_has_veiculo.usuario_id', user.id_usuario);
        qb.join('estado', 'estado.id_estado','=','veiculo.estado_id');
        qb.join('usuario_has_veiculo', 'veiculo.id_veiculo','=','usuario_has_veiculo.veiculo_id');
        qb.select('veiculo.*');
        qb.select('estado.*');
       console.log('sql'+qb);
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



exports.saveTransaction = function(entidade1, entidade2, entidade3, func){
        Bookshelf.transaction(function(t) {
            entidade1.save(null, {
                transacting: t
            }).
            then(function(entidade1) {
                util.log(entidade1);
                entidade2.save({
                    pessoa_id: entidade1.id,
                }, {
                    transacting: t
                }).then(function(model, err) {
                          util.log("Commit");
                        t.commit();
                    }),
                    function() {
                        t.rollback();
                           util.log("rollback");
                        func(false);
                    }
                });
        }).then(function(model) {
             util.log("Passei aq");
             func(true);
        }, function() {
            util.log("Ocorreu erro");
            func(false);
        });
}