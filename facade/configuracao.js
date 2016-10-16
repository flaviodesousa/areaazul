/**
 * Created by flavio on 10/10/16.
 */
const Bookshelf = require('../database');
const Configuracao = Bookshelf.model('Configuracao');
const validator = require('validator');

module.exports.getConfiguracaoTempo = function() {
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

module.exports.alterar = function(camposConfiguracao) {
  return new Configuracao()
    .fetch()
    .then(function(configuracao) {
      const configuracoes = {
        valor_ativacao: camposConfiguracao.valor_ativacao,
        tempo_tolerancia: camposConfiguracao.tempo_tolerancia,
        franquia: camposConfiguracao.franquia,
        ciclo_ativacao: camposConfiguracao.ciclo_ativacao,
        ciclo_fiscalizacao: camposConfiguracao.ciclo_fiscalizacao,
        cidade_id: camposConfiguracao.cidade_id
      };
      if (configuracao == null) {
        return Configuracao
          .forge(configuracoes)
          .save();
      }
      return configuracao
        .save(configuracoes, { method: 'update' }, { patch: true });
    })
    .then(configuracao => {
      return configuracao.toJSON();
    });
};

module.exports.buscarConfiguracao = function() {
  return Configuracao
    .forge()
    .fetch();
};

module.exports.validar = function(config) {
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
