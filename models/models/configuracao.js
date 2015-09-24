'use script';

var Bookshelf = require('bookshelf').conexaoMain;
var util = require('./util');

var Configuracao = Bookshelf.Model.extend({
    tableName: 'configuracao',
    idAttribute: 'id_configuracao'
}, {

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
    }
});

module.exports = Configuracao;