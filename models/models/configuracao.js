'use script';

var Bookshelf = require('bookshelf').conexaoMain;
var util = require('../../helpers/util');
var _ = require('lodash');

var Configuracao = Bookshelf.Model.extend({
    tableName: 'configuracao',
    idAttribute: 'id_configuracao'
}, {

    _calcular_valor_tempo: function(config) {
        var tempos = [];

    },
    getConfiguracaoTempo: function() {
        var tempos = [];
        tempos.push({
            quantidade_tempo: '60',
            preco: 2.00
        });
        tempos.push({
            quantidade_tempo: '120',
            preco: 4.00
        });
        tempos.push({
            quantidade_tempo: '180',
            preco: 6.00
        });
        tempos.push({
            quantidade_tempo: '180',
            preco: 8.00
        });
        return tempos;
    },

    alterar: function(config, options) {
        console.log('teste-teste');
        console.dir(config);
        return Bookshelf.transaction(function(t) {
            var optionsUpdate = _.merge({}, options || {}, {
                method: 'update'
            }, {
                patch: true
            });
            var optionsInsert = _.merge({}, options || {}, {
                method: 'insert'
            });

            return 
                 Configuracao
                    .forge()
                    .fetch()
                    .then(function(configuracao) {
                        var configuracoes = {
                            valor_ativacao: config.valor_ativacao,
                            tempo_tolerancia: config.tempo_tolerancia,
                            franquia: config.franquia,
                            ciclo_ativacao: config.ciclo_ativacao,
                            ciclo_fiscalizacao: config.ciclo_fiscalizacao,
                        };
                        if (configuracao == null) {
                            return Configuracao
                                .forge(configuracoes)
                                .save(null, optionsInsert);
                        }
                        return configuracao
                            .save(configuracoes, optionsUpdate);
                    });
        });
    },

    buscarConfiguracao: function() {
        return Configuracao
            .forge()
            .fetch();
    },

    validar: function(config) {

        console.dir(config);

        var message = [];

        if (validator.isNull(config.valor_ativacao)) {
            message.push({
                attribute: 'valor_ativacao',
                problem: 'Campo valor de ativação é obrigatório!',
            });
        }
        if (validator.isNull(config.tempo_tolerancia)) {
            message.push({
                attribute: 'tempo_tolerancia',
                problem: 'Campo tempo de tolerancia é obrigatório!',
            });
        }

        if (validator.isNull(config.franquia)) {
            message.push({
                attribute: 'franquia',
                problem: 'Campo franquia é obrigatório!',
            });
        }
        if (validator.isNull(config.ciclo_ativacao)) {
            message.push({
                attribute: 'ciclo_ativacao',
                problem: 'Campo ciclo de ativacao é obrigatório!',
            });
        }

        if (validator.isNull(config.ciclo_fiscalizacao)) {
            message.push({
                attribute: 'ciclo_fiscalizacao',
                problem: 'Campo ciclo de fiscalizacao é obrigatório!',
            });
        }

        return message;
    }
});

module.exports = Configuracao;