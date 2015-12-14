'use strict';

var _ = require('lodash');
var Bookshelf = require('bookshelf').conexaoMain;
var validator = require('validator');
var validation = require('./validation');
var util = require('../../helpers/util');
var AreaAzul = require('../../areaazul.js');

var Usuario = require('./usuario');
var UsuarioHasVeiculo = require('./usuario_has_veiculo');

var Veiculo = Bookshelf.Model.extend({
  tableName: 'veiculo',
  idAttribute: 'id_veiculo',
  usuarios: function() {
    return this.belongsToMany(Usuario)
        .through(UsuarioHasVeiculo);
  },
}, {

  _cadastrar: function(vehicle, options) {
    var optionsInsert = _.merge({}, options || {}, {
      method: 'insert',
    });



console.dir(vehicle);
    return Veiculo
          .validarVeiculo(vehicle)
              .then(function(messages) {
                if (messages.length) {

                   console.dir(messages);

                  throw new AreaAzul
                      .BusinessException(
                          'Nao foi possivel cadastrar novo Veiculo. Dados invalidos',
                          messages);
                }

                return messages;
              })
        .then(function() {
          return Veiculo
                .forge({
                  cidade_id: vehicle.cidade_id,
                  placa: vehicle.placa,
                  marca: vehicle.marca,
                  modelo: vehicle.modelo,
                  cor: vehicle.cor,
                  ano_fabricado: vehicle.ano_fabricado,
                  ano_modelo: vehicle.ano_modelo,
                  ativo: true,
                })
                .save(null, optionsInsert)
                .then(function(veiculo) {
                  return veiculo;
                });
        })
        .then(function(veiculo){
            if(vehicle.usuario_pessoa_id){
                return UsuarioHasVeiculo.cadastrar({
                  usuario_pessoa_id: vehicle.usuario_pessoa_id,
                  veiculo_id: veiculo.id,
                });
            }
            return veiculo;
        });
  },


  cadastrar: function(vehicle){
    var options;
    return Veiculo._cadastrarVeiculo(vehicle);
  },

  _cadastrarVeiculo: function(vehicle) {

    return Bookshelf.transaction(function(t) {

       return Veiculo._cadastrar(vehicle, { transacting: t });
       
    });
  },

  procurarVeiculo: function(placa) {
     var placaSemMascara = '';

    if (placa) {
      placaSemMascara = util.placaSemMascara(placa);
    }
    return Veiculo.forge().query(function(qb) {
      qb.where('veiculo.placa', placaSemMascara);
      qb.join('cidade', 'veiculo.cidade_id', '=', 'cidade.id_cidade');
      qb.join('estado', 'cidade.estado_id', '=', 'estado.id_estado');
      qb.select('veiculo.*');
      qb.select('cidade.*');
      qb.select('estado.id_estado');
      qb.select('estado.uf');
    }).fetch();
  },

  validarVeiculo: function(veiculo) {

    var message = [];
    if (validator.isNull(veiculo.cidade_id)) {
      message.push({
        attribute: 'cidade',
        problem: 'Cidade é obrigatória!',
      });
    }
    if (validator.isNull(veiculo.placa)) {
      message.push({
        attribute: 'placa',
        problem: 'Campo placa é obrigatória!',
      });
    }
    if (validator.isNull(veiculo.modelo)) {
      message.push({
        attribute: 'modelo',
        problem: 'Campo modelo é obrigatório!',
      });
    }
    if (validator.isNull(veiculo.marca)) {
      message.push({
        attribute: 'marca',
        problem: 'Campo marca é obrigatório!',
      });
    }
    if (validator.isNull(veiculo.cor)) {
      message.push({
        attribute: 'cor',
        problem: 'Campo cor é obrigatório!',
      });
    }

    var placaSemMascara = '';
    if (veiculo.placa) {
      placaSemMascara = util.placaSemMascara(veiculo.placa);
    }

    return Veiculo
        .procurarVeiculo(placaSemMascara)
            .then(function(veiculo) {
              if (veiculo) {
                message.push({
                  attribute: 'placa',
                  problem: 'Veiculo já cadastrado!',
                });
              }

              return message;
            });
  },

});
module.exports = Veiculo;
