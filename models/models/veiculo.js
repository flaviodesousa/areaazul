'use strict';

var debug = require('debug')('areaazul:model:veiculo');
var _ = require('lodash');
var validator = require('validator');

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
var util = require('../../helpers/util');

const UsuarioHasVeiculo = Bookshelf.model('UsuarioHasVeiculo');

var Veiculo = Bookshelf.Model.extend({
  tableName: 'veiculo',
  usuarios: function() {
    return this.belongsToMany('Usuario')
        .through('UsuarioHasVeiculo');
  },
}, {

  _cadastrar: function(vehicle, options) {
    var optionsInsert = _.merge({ method: 'insert', }, options || {});

    var placaSemMascara = util.placaSemMascara(vehicle.placa);

    return Veiculo
      .validarVeiculo(vehicle)
      .then(function(messages) {
        if (messages && messages.length) {
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
            placa: placaSemMascara,
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
      .then(function(veiculo) {
        if (vehicle.pessoa_fisica_id) {
          return UsuarioHasVeiculo
            ._salvar({
              pessoa_fisica_id: vehicle.pessoa_fisica_id,
              veiculo_id: veiculo.id,
            }, options);
        }
        return veiculo;
      });
  },


  cadastrar: function(vehicle) {

    return Bookshelf.transaction(function(t) {

      return Veiculo._cadastrar(vehicle, { transacting: t });

    });
  },

  desativar: function(id) {
    return Veiculo
      .forge({ id: id })
      .fetch()
      .then(function(veiculo) {
        if (veiculo) {
          return veiculo
            .save({ ativo: false }, { patch: true });
        }
        throw new AreaAzul.BusinessException(
            'Desativacao: Veiculo não encontrado', {
                desativacao: id
              });
      });
  },

  procurarVeiculo: function(placa) {
    var placaSemMascara = '';

    if (placa) {
      placaSemMascara = util.placaSemMascara(placa);
    }
    return Veiculo
      .forge()
      .query(function(qb) {
        qb.where('veiculo.placa', placaSemMascara);
        qb.join('cidade', 'veiculo.cidade_id', 'cidade.id');
        qb.join('estado', 'cidade.estado_id', 'estado.id');
        qb.select('veiculo.*');
        qb.select('cidade.*');
        qb.select('estado.*');
      })
      .fetch();
  },

  validarVeiculo: function(veiculo) {

    var message = [];
    if (!veiculo.cidade_id) {
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
      .then(function(veiculoExistente) {
        if (veiculoExistente && veiculoExistente.id !== veiculo.id) {
          message.push({
            attribute: 'placa',
            problem: 'Veiculo já cadastrado!'
          });
        }

        return message;
      });
  },
});
Bookshelf.model('Veiculo', Veiculo);
module.exports = Veiculo;
