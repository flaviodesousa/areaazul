'use strict';

const money = require('money-math');
const Bookshelf = require('../../database');

var Configuracao = Bookshelf.Model.extend(
{
  tableName: 'configuracao'
}, {
  _buscar: () =>
    new Configuracao()
      .fetch({ require: true })
      .catch(Bookshelf.NotFoundError, () =>
        // TODO: Falhar neste caso, configuração via sysadmin tools
        new Configuracao({
          // Minutos sem necessidade de ativação
          franquia_minutos: 15,
          // Minutos após a primeira notificação sem autuação
          tempo_tolerancia_minutos: 10,
          // Ciclo ativação (?)
          ciclo_ativacao_minutos: 0,
          // Ciclo fiscalização (?)
          ciclo_fiscalizacao_minutos: 0,
          // Valor da ativação (1 hora)
          valor_ativacao_reais: money.floatToAmount(1.20),
          // Cidade
          cidade_id: 1
        })
          .save()
          .then(configuracao => configuracao.fetch()))
});
Bookshelf.model('Configuracao', Configuracao);

module.exports = Configuracao;
