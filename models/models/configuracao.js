'use script';

var Bookshelf = require('bookshelf').conexaoMain;
var util = require('./util');

var Configuracao = Bookshelf.Model.extend({
    tableName: 'configuracao',
    idAttribute: 'id_configuracao'
},{

  getConfiguracaoTempo: function(){
    var tempos = [];
    tempos.push({atribute: '60', valor: 2.00});
    tempos.push({atribute: '120', valor: 4.00});
    tempos.push({atribute: '180', valor: 6.00});
    tempos.push({atribute: '180', valor: 8.00});
    return tempos;
  }
});

module.exports = Configuracao;