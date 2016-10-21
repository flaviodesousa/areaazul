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

module.exports.alterar = function(camposConfig) {
  return new Configuracao()
    .fetch()
    .then(function(configuracao) {
      const configuracoes = {
        valor_ativacao_reais: camposConfig.valor_ativacao_reais,
        tempo_tolerancia_minutos: camposConfig.tempo_tolerancia_minutos,
        franquia_minutos: camposConfig.franquia_minutos,
        ciclo_ativacao_minutos: camposConfig.ciclo_ativacao_minutos,
        ciclo_fiscalizacao_minutos:
          camposConfig.ciclo_fiscalizacao_minutos,
        cidade_id: camposConfig.cidade_id
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

module.exports.buscar = function() {
  return Configuracao
    ._buscar()
    .then(configuracao => configuracao.toJSON());
};

module.exports.validar = function(config) {
  var message = [];

  if (validator.isNull(config.valor_ativacao_reais)) {
    message.push(
      {
        attribute: 'valor_ativacao',
        problem: 'Campo valor de ativação é obrigatório!'
      });
  }
  if (validator.isNull(config.tempo_tolerancia_minutos)) {
    message.push(
      {
        attribute: 'tempo_tolerancia',
        problem: 'Campo tempo de tolerancia é obrigatório!'
      });
  }

  if (validator.isNull(config.franquia_minutos)) {
    message.push(
      {
        attribute: 'franquia',
        problem: 'Campo franquia é obrigatório!'
      });
  }
  if (validator.isNull(config.ciclo_ativacao_minutos)) {
    message.push(
      {
        attribute: 'ciclo_ativacao',
        problem: 'Campo ciclo de ativacao é obrigatório!'
      });
  }

  if (validator.isNull(config.ciclo_fiscalizacao_minutos)) {
    message.push(
      {
        attribute: 'ciclo_fiscalizacao',
        problem: 'Campo ciclo de fiscalizacao é obrigatório!'
      });
  }

  return message;
};
