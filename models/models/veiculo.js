'use strict';

const _ = require('lodash');
const validator = require('validator');

const AreaAzul = require('../../areaazul');
const Bookshelf = require('../../database');
const log = require('../../logging');
const util = require('areaazul-utils');

var Veiculo = Bookshelf.Model.extend({
  tableName: 'veiculo',
  cidade: function() {
    return this.belongsTo('Cidade', 'cidade_id');
  },
  usuarios: function() {
    return this.belongsToMany('Usuario')
      .through('UsuarioHasVeiculo');
  }
}, {
  _cadastrar: function(veiculoFields, options) {
    var veiculo = null;
    var optionsInsert = _.merge({ method: 'insert' }, options || {});

    var placaSemMascara = util.placaSemMascara(veiculoFields.placa);

    return Veiculo
      ._validarVeiculo(veiculoFields, options)
      .then(function(messages) {
        if (messages && messages.length) {
          throw new AreaAzul
            .BusinessException(
            'Não foi possível cadastrar novo Veículo. Dados inválidos',
            messages);
        }
        return messages;
      })
      .then(function() {
        return Veiculo
          .forge({
            cidade_id: veiculoFields.cidade_id,
            placa: placaSemMascara,
            tipo: veiculoFields.tipo,
            marca: veiculoFields.marca,
            modelo: veiculoFields.modelo,
            cor: veiculoFields.cor,
            ano_fabricado: veiculoFields.ano_fabricado,
            ano_modelo: veiculoFields.ano_modelo
          })
          .save(null, optionsInsert);
      })
      .then(function(v) {
        veiculo = v;
        if (veiculoFields.usuario_id) {
          const UsuarioHasVeiculo = Bookshelf.model('UsuarioHasVeiculo');
          return UsuarioHasVeiculo
            ._salvar({
              usuario_id: veiculoFields.usuario_id,
              veiculo_id: veiculo.id
            }, optionsInsert);
        }
      })
      .then(() =>
        Veiculo
          ._buscarPorId(veiculo.id, options));
  },
  TIPOS: /^(carro|moto|camionete)$/,
  _validarVeiculo: (veiculoFields, options) => {
    var message = [];

    if (!veiculoFields.cidade_id) {
      message.push({
        attribute: 'cidade',
        problem: 'Cidade é obrigatória!'
      });
    }

    if (!veiculoFields.placa || validator.isNull('' + veiculoFields.placa)) {
      message.push({
        attribute: 'placa',
        problem: 'Campo placa é obrigatória!'
      });
    }

    var placaSemMascara = util.placaSemMascara(veiculoFields.placa);
    if (!placaSemMascara ||
      placaSemMascara.replace(/[^0-9]/g, '').length != 4 ||
      placaSemMascara.replace(/[^A-Z]/gi, '').length != 3) {
      message.push({
        attribute: 'placa',
        problem: 'Placa inválida, deve ter 3 letras e 4 dígitos'
      });
    }

    if (!veiculoFields.tipo || validator.isNull('' + veiculoFields.tipo)) {
      message.push({
        attribute: 'tipo',
        problem: 'Tipo de veículo é obrigatório'
      });
    } else if (!Veiculo.TIPOS.test(veiculoFields.tipo)) {
      message.push({
        attribute: 'tipo',
        problem: 'Tipo de veículo não reconhecido'
      });
    }

    if (!veiculoFields.modelo || validator.isNull('' + veiculoFields.modelo)) {
      message.push({
        attribute: 'modelo',
        problem: 'Campo modelo é obrigatório!'
      });
    }

    if (!veiculoFields.marca || validator.isNull('' + veiculoFields.marca)) {
      message.push({
        attribute: 'marca',
        problem: 'Campo marca é obrigatório!'
      });
    }

    if (!veiculoFields.cor || validator.isNull('' + veiculoFields.cor)) {
      message.push({
        attribute: 'cor',
        problem: 'Campo cor é obrigatório!'
      });
    }

    return Veiculo
      ._buscarPorPlaca(placaSemMascara, options)
      .then(function(veiculoExistente) {
        if (veiculoExistente && veiculoExistente.id !== veiculoFields.id) {
          message.push({
            attribute: 'placa',
            problem: 'Veiculo já cadastrado!'
          });
        }

        return message;
      });

  },
  _buscarPorPlaca: (placa, options) => {
    var placaSemMascara = '';

    if (placa) {
      placaSemMascara = util.placaSemMascara(placa);
    }
    return new Veiculo({ placa: placaSemMascara })
      .fetch(_.merge({ withRelated: [ 'cidade.estado' ] }, options));
  },
  _buscarPorId: (id, options) => new Veiculo({ id: id })
      .fetch(_.merge({
        withRelated: [ 'cidade.estado' ],
        require: true
      }, options))
      .catch(Bookshelf.NotFoundError, () => {
        const err = new AreaAzul.BusinessException(
          'Veículo: id não encontrado',
          { id: id });
        log.warn(err.message, err.details);
        throw err;
      })

});
Bookshelf.model('Veiculo', Veiculo);

module.exports = Veiculo;
