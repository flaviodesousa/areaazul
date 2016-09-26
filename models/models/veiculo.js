'use strict';

var debug = require('debug')('areaazul:model:veiculo');
var _ = require('lodash');
var validator = require('validator');

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
var util = require('../../helpers/util');

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
            'Nao foi possivel cadastrar novo Veiculo. Dados invalidos',
            messages);
        }
        return messages;
      })
      .then(function() {
        return Veiculo
          .forge({
            cidade_id: veiculoFields.cidade_id,
            placa: placaSemMascara,
            marca: veiculoFields.marca,
            modelo: veiculoFields.modelo,
            cor: veiculoFields.cor,
            ano_fabricado: veiculoFields.ano_fabricado,
            ano_modelo: veiculoFields.ano_modelo,
            ativo: true
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
            }, optionsInsert)
            .return(veiculo);
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

  _procurarVeiculo: (placa, options) => {
    var placaSemMascara = '';

    if (placa) {
      placaSemMascara = util.placaSemMascara(placa);
    }
    return new Veiculo({ placa: placaSemMascara })
      .fetch(_.merge({ withRelated: [ 'cidade', 'cidade.estado' ] }, options));
  },

  procurarVeiculo: function(placa) {
    return Bookshelf.transaction(t => {
      return Veiculo._procurarVeiculo(placa, { transacting: t });
    });
  },

  _validarVeiculo: (veiculoFields, options) => {
    var message = [];
    if (!veiculoFields.cidade_id) {
      message.push({
        attribute: 'cidade',
        problem: 'Cidade é obrigatória!'
      });
    }
    if (validator.isNull(veiculoFields.placa)) {
      message.push({
        attribute: 'placa',
        problem: 'Campo placa é obrigatória!'
      });
    }
    if (validator.isNull(veiculoFields.modelo)) {
      message.push({
        attribute: 'modelo',
        problem: 'Campo modelo é obrigatório!'
      });
    }
    if (validator.isNull(veiculoFields.marca)) {
      message.push({
        attribute: 'marca',
        problem: 'Campo marca é obrigatório!'
      });
    }
    if (validator.isNull(veiculoFields.cor)) {
      message.push({
        attribute: 'cor',
        problem: 'Campo cor é obrigatório!'
      });
    }

    var placaSemMascara = '';
    if (veiculoFields.placa) {
      placaSemMascara = util.placaSemMascara(veiculoFields.placa);
    }

    return Veiculo
      ._procurarVeiculo(placaSemMascara, options)
      .then(function(veiculoExistente) {
        if (veiculoExistente && veiculoExistente.id !== veiculoFields.id) {
          message.push({
            attribute: 'placa',
            problem: 'Veiculo já cadastrado!'
          });
        }

        return message;
      });

  }
});
Bookshelf.model('Veiculo', Veiculo);

module.exports = Veiculo;
