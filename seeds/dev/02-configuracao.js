/**
 * Created by flavio on 10/30/16.
 */

'use strict';
exports.seed = function(knex) {
  return knex('configuracao').del()
    .then(() => knex('conta').del())
    .then(() => knex('conta').returning('id').insert({ data_abertura: new Date() }))
    .then(conta => knex('configuracao').insert({
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
      cidade_id: 1775,
      conta_id: conta[0],
      parametros: {
        mapa: {
          latitude: -15.797808,
          longitude: -47.887430,
          zoom: 10
        },
        hora: 'Brazil/East',
        horas: ['America/Manaus', 'Brazil/West', 'America/Noronha', 'Brazil/DeNoronha', 'America/Rio_Branco', 'Brazil/Acre',
          'America/Sao_Paulo', 'Brazil/East'
        ],
        revenda: {
          preco_credito: {
            normal: 0.95,
            credenciado: 0.9
          }
        },
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
