'use strict';

const _ = require('lodash');
const debug = require('debug')('areaazul:model:configuracao');
const validator = require('validator');
const Promise = require('bluebird');

const AreaAzul = require('../areaazul');
const Bookshelf = require('../database');

const Configuracao = Bookshelf.Model.extend(
{
  tableName: 'configuracao'
}, {
  _camposValidos: function(config) {
    let message = [];

    if (validator.isNull(config.valor_ativacao_reais)) {
      message.push(
        {
          attribute: 'valor_ativacao',
          problem: 'Valor de ativação é obrigatório!'
        });
    }
    if (validator.isNull(config.tempo_tolerancia_minutos)) {
      message.push(
        {
          attribute: 'tempo_tolerancia',
          problem: 'Tempo de tolerância é obrigatório!'
        });
    }

    if (validator.isNull(config.franquia_minutos)) {
      message.push(
        {
          attribute: 'franquia',
          problem: 'Franquia é obrigatória!'
        });
    }
    if (validator.isNull(config.ciclo_ativacao_minutos)) {
      message.push(
        {
          attribute: 'ciclo_ativacao',
          problem: 'Ciclo de ativaćão é obrigatório!'
        });
    }

    if (validator.isNull(config.ciclo_fiscalizacao_minutos)) {
      message.push(
        {
          attribute: 'ciclo_fiscalizacao',
          problem: 'Ciclo de fiscalizaćão é obrigatório!'
        });
    }

    return Promise.resolve(message);
  },
  _buscar: () =>
    new Configuracao()
      .fetch({ require: true })
      .catch(Bookshelf.NotFoundError, () => {
        // TODO: Falhar neste caso, configuração via sysadmin tools
        throw new AreaAzul.BusinessException(
          'Não há configuração disponível',
          'Inicializar manualmente com seed ou sysadmin tools'
        );
      }),
  _alterar: (camposConfig, options) => Configuracao
    ._camposValidos(camposConfig)
    .then(messages => {
      if (messages && messages.length) {
        debug('_alterar() configuração inválida');
        throw new AreaAzul
          .BusinessException(
          'Não foi possível alterar configuração. Dados inválidos',
          messages);
      }
      return new Configuracao().fetch();
    })
    .then(configuracao => {
      const configuracoes = {
        valor_ativacao_reais: camposConfig.valor_ativacao_reais,
        tempo_tolerancia_minutos: camposConfig.tempo_tolerancia_minutos,
        franquia_minutos: camposConfig.franquia_minutos,
        ciclo_ativacao_minutos: camposConfig.ciclo_ativacao_minutos,
        ciclo_fiscalizacao_minutos:
        camposConfig.ciclo_fiscalizacao_minutos,
        cidade_id: camposConfig.cidade_id
      };
      if (configuracao) {
        return configuracao
          .save(configuracoes,
            _.merge({ method: 'update', patch: true }, options));
      }
      return new Configuracao(configuracoes)
        .save(null, options);
    })
});
Bookshelf.model('Configuracao', Configuracao);

module.exports = Configuracao;
