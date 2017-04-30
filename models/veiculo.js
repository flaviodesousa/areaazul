'use strict';

const _ = require('lodash');
const AU = require('areaazul-utils');

const AreaAzul = require('../areaazul');
const Bookshelf = require('../database');
const log = require('../logging');

const Veiculo = Bookshelf.Model.extend({
  tableName: 'veiculo',
  cidade: function() {
    return this.belongsTo('Cidade', 'cidade_id');
  }
}, {
  _cadastrar: function(veiculoFields, options) {
    let veiculo = null;
    const optionsInsert = _.merge({ method: 'insert' }, options || {});

    const placaSemMascara = AU.placaSemMascara(veiculoFields.placa);

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
  TIPOS: /^(carro|moto|utilitário)$/,
  _validarVeiculo: (veiculoFields, options) => {
    let message = [];

    if (!veiculoFields.cidade_id) {
      message.push({
        attribute: 'cidade',
        problem: 'Cidade é obrigatória!'
      });
    }

    if (!AU.isTexto(veiculoFields.placa)) {
      message.push({
        attribute: 'placa',
        problem: 'Campo placa é obrigatória!'
      });
    }

    const placaSemMascara = AU.placaSemMascara(veiculoFields.placa);
    if (!AU.isPlaca(veiculoFields.placa)) {
      message.push({
        attribute: 'placa',
        problem: 'Placa inválida. Deve seguir o padrão DENATRAN ou Mercosul.'
      });
    }

    if (!AU.isTexto(veiculoFields.tipo)) {
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
    let placaSemMascara = '';

    if (placa) {
      placaSemMascara = AU.placaSemMascara(placa);
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

const Veiculos = Bookshelf.Collection.extend({
  model: Veiculo
}, {
});
Bookshelf.collection('Veiculos', Veiculos);
