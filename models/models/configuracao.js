'use script';

var Bookshelf = require('bookshelf').conexaoMain;
var util = require('../../helpers/util');
var _ = require('lodash');

var Configuracao = Bookshelf.Model.extend({
    tableName: 'configuracao',
    idAttribute: 'id_configuracao'
}, {

    _calcular_valor_tempo: function(config){
        var tempos =[];







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

    _salvar: function(){
        return Configuracao
               .forge({
                    

                })
               .save(null, optionsInsert)
                .then(function(configuracao) {
                    return configuracao;
                });

    },

    cadastrar: function(){

    }

});

module.exports = Configuracao;