/**
 * Created by flavio on 10/10/16.
 */
const Bookshelf = require('../database');
const Configuracao = Bookshelf.model('Configuracao');
const validator = require('validator');

module.export.getConfiguracaoTempo = function() {
  return [ {
    quantidade_tempo: '60',
    preco: 2.00
  }, {
    quantidade_tempo: '120',
    preco: 4.00
  }, {
    quantidade_tempo: '180',
    preco: 6.00
  }, {
    quantidade_tempo: '180',
    preco: 8.00
  } ];
};

module.export.alterar = function(config) {
  return new Configuracao()
    .fetch()
    .then(
      function(configuracao) {
        var configuracoes = {
          valor_ativacao: config.valor_ativacao,
          tempo_tolerancia: config.tempo_tolerancia,
          franquia: config.franquia,
          ciclo_ativacao: config.ciclo_ativacao,
          ciclo_fiscalizacao: config.ciclo_fiscalizacao,
          cidade_id: config.cidade_id
        };
        if (configuracao == null) {
          return Configuracao
            .forge(configuracoes)
            .save();
        }
        return configuracao
          .save(configuracoes, { method: 'update' }, { patch: true });
      });
};

module.export.buscarConfiguracao = function() {
  return Configuracao
    .forge()
    .fetch();
};

module.export.validar = function(config) {
  var message = [];

  if (validator.isNull(config.valor_ativacao)) {
    message.push(
      {
        attribute: 'valor_ativacao',
        problem: 'Campo valor de ativação é obrigatório!'
      });
  }
  if (validator.isNull(config.tempo_tolerancia)) {
    message.push(
      {
        attribute: 'tempo_tolerancia',
        problem: 'Campo tempo de tolerancia é obrigatório!'
      });
  }

  if (validator.isNull(config.franquia)) {
    message.push(
      {
        attribute: 'franquia',
        problem: 'Campo franquia é obrigatório!'
      });
  }
  if (validator.isNull(config.ciclo_ativacao)) {
    message.push(
      {
        attribute: 'ciclo_ativacao',
        problem: 'Campo ciclo de ativacao é obrigatório!'
      });
  }

  if (validator.isNull(config.ciclo_fiscalizacao)) {
    message.push(
      {
        attribute: 'ciclo_fiscalizacao',
        problem: 'Campo ciclo de fiscalizacao é obrigatório!'
      });
  }

  return message;
};
