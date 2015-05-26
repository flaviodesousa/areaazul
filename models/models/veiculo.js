'use strict';

var _ = require('lodash');
var Bookshelf = require('bookshelf').conexaoMain;
var validator = require('validator');
var validation = require('./validation');
var util = require('./util');

var Usuario = require('./usuario').Usuario;
var UsuarioHasVeiculo = require('./usuario_has_veiculo');

var Veiculo = Bookshelf.Model.extend({
  tableName: 'veiculo',
  idAttribute: 'id_veiculo',
  usuarios: function() {
    return this.belongsToMany(Usuario)
      .through(UsuarioHasVeiculo);
  },
}, {

  cadastrar: function(vehicle, user) {
    return Bookshelf.transaction(function(t) {
      var trx = { transacting: t };
      var trxIns = _.merge(trx, { method: 'insert' });

      return Veiculo
        .forge({
          placa: vehicle.placa,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          cor: vehicle.cor,
          ano_fabricado: vehicle.ano_fabricado,
          ano_modelo: vehicle.ano_modelo,
          ativo: true,
        })
        .save()
        .then(function(veiculo) {
          if (veiculo !== null) {
            return veiculo;
          }
        })
        .then(function(veiculo) {
          return UsuarioHasVeiculo
            .forge({
              usuario_id: user.id,
              veiculo_id: veiculo.get('veiculo_id'),
            })
            .save(null, trxIns);
        });
    });
  },
});

module.exports = Veiculo;

var VeiculoCollection =  Bookshelf.Collection.extend({
  model: Veiculo,
});

exports.listar = function(then, fail) {
  VeiculoCollection.forge().query(function(qb) {
    qb.join('estado', 'estado.id_estado', '=', 'veiculo.estado_id');
    qb.select('veiculo.*');
    qb.select('estado.*');
  }).fetch().then(function(collection) {
    util.log('Sucesso!');
    then(collection);
  }).catch(function(err) {
    console.log(err);
    util.log('Ocorreu erro!');
    fail(err);
  });

};

exports.listarVeiculosUsuario = function(user, then, fail) {
  VeiculoCollection.forge().query(function(qb) {
    qb.where('usuario_has_veiculo.usuario_id', user.id_usuario);
    qb.join('estado', 'estado.id_estado', '=', 'veiculo.estado_id');
    qb.join('usuario_has_veiculo',
      'veiculo.id_veiculo', '=', 'usuario_has_veiculo.veiculo_id');
    qb.select('veiculo.*');
    qb.select('estado.*');
    console.log('sql' + qb);
  }).fetch().then(function(collection) {
    util.log('Sucesso!');
    then(collection);
  }).catch(function(err) {
    console.log(err);
    util.log('Ocorreu erro!');
    fail(err);
  });

};


exports.procurar = function(vehicle, then, fail) {
  Veiculo.forge().query(function(qb) {
    qb.where('veiculo.id_veiculo', vehicle.id_veiculo);
    qb.join('estado', 'estado.id_estado', '=', 'veiculo.estado_id');
    qb.select('veiculo.*');
    qb.select('estado.*');
  }).fetch().then(function(collection) {
    then(collection);
  }).catch(function(err) {
    fail(err);
  });
};

exports.editar = function(vehicle, then, fail) {
  new this.Veiculo({
    id_veiculo: vehicle.id_veiculo,
  }).fetch().then(function(model) {
    model.save(vehicle).then(function(model) {
      util.log('Sucesso!');
      then(model);
    }).catch(function(err) {
      console.log(err);
      util.log('Ocorreu erro!');
      fail(err);
    });
  });
};

exports.procurarVeiculoPorPlaca = function(vehicle, then, fail) {
  Veiculo.forge().query(function(qb) {
    qb.where('veiculo.placa', vehicle.placa);
    qb.select('veiculo.*');
    console.log('sql: ' + qb);
  }).fetch().then(function(model) {
      console.log('passei aq');
      then(model);
    }).catch(function(err) {
      console.log('err' + err);
      fail(err);
    });

};


exports.desativar = function(vehicle, then, fail) {
  new this.Veiculo({
    id_veiculo: vehicle.id_veiculo,
  }).fetch().then(function(model) {
    model.save(vehicle).then(function(model) {
      util.log('Sucesso!');
      then(model);
    }).catch(function(err) {
      console.log(err);
      util.log('Ocorreu erro!');
      fail(err);
    });
  });
};

exports.validate = function(vehicle) {
  var message = [];
  if (validator.isNull(vehicle.estado_id)) {
    message.push({
      attribute: 'estado',
      problem: 'Estado é obrigatório!',
    });
  }
  if (validator.isNull(vehicle.placa)) {
    message.push({
      attribute: 'placa',
      problem: 'Placa é obrigatória!',
    });
  }
  if (validator.isNull(vehicle.modelo)) {
    message.push({
      attribute: 'modelo',
      problem: 'Modelo é obrigatório!',
    });
  }
  if (validator.isNull(vehicle.marca)) {
    message.push({
      attribute: 'marca',
      problem: 'Marca é obrigatória!',
    });
  }
  if (validator.isNull(vehicle.cor)) {
    message.push({
      attribute: 'cor',
      problem: 'Cor é obrigatória!',
    });
  }
  if (validator.isNull(vehicle.ano_fabricado)) {
    message.push({
      attribute: 'ano_fabricado',
      problem: 'Ano de fabricação é obrigatório!',
    });
  }
  if (validator.isNull(vehicle.ano_modelo)) {
    message.push({
      attribute: 'ano_modelo',
      problem: 'Ano de modelo é obrigatório!',
    });
  }
  if (!validator.isNumeric(vehicle.ano_fabricado)) {
    message.push({
      attribute: 'ano_fabricado',
      problem: 'Ano de fabricação é inválido!',
    });
  }
  if (!validator.isNumeric(vehicle.ano_modelo)) {
    message.push({
      attribute: 'ano_modelo',
      problem: 'Ano de modelo é inválido!',
    });
  }
  if (!validation.validaPlaca(vehicle)) {
    message.push({
      attribute: 'placa',
      problem: 'Placa é inválida!',
    });
  }
  return true;
};

