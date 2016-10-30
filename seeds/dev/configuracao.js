/**
 * Created by flavio on 10/30/16.
 */

'use strict';
exports.seed = function(knex, Promise) {
  return Promise.join(
    // Deletes ALL existing entries
    knex('configuracao')
      .del(),
    knex('configuracao')
      .insert({
        // Minutos sem necessidade de ativação
        franquia_minutos: 15,
        // Minutos após a primeira notificação sem autuação
        tempo_tolerancia_minutos: 10,
        // Ciclo ativação (?)
        ciclo_ativacao_minutos: 0,
        // Ciclo fiscalização (?)
        ciclo_fiscalizacao_minutos: 0,
        // Valor da ativação (1 hora)
        valor_ativacao_reais: 1.20,
        // Cidade
        cidade_id: 2061,
        parametros: {
          permanencia_maxima_minutos: 240,
          matriz_precos: [ {
            label: '1 hora',
            permanencia_maxima_minutos: '60',
            preco_por_hora: { carro: 1.50, moto: 0.80, camionete: 2.00 }
          }, {
            label: '2 horas',
            permanencia_maxima_minutos: '120',
            preco_por_hora: { carro: 1.50, moto: 0.80, camionete: 2.00 }
          }, {
            label: '3 horas',
            permanencia_maxima_minutos: '180',
            preco_por_hora: { carro: 1.75, moto: 1.00, camionete: 2.50 }
          }, {
            label: '4 horas',
            permanencia_maxima_minutos: '240',
            preco_por_hora: { carro: 2.00, moto: 1.20, camionete: 3.00 }
          } ]
        }
      }));
};
