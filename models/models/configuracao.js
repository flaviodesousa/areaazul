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
        return Bookshelf.transaction(function(t) {
            var optionsUpdate = _.merge({}, options || {}, {
                method: 'update'
            }, {
                patch: true
            });
            var optionsInsert = _.merge({}, options || {}, {method: 'insert'});



            return Configuracao
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


                    console.log("configuracao");
                    console.dir(configuracao);
                    if(configuracao == null){
                        return Configuracao
                                .forge(configuracoes)
                                .save(null, optionsInsert);
                    }
                    return configuracao
                        .save(configuracoes, optionsUpdate);
                });
        });
    }
});

module.exports = Configuracao;