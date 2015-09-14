'use script';

var Bookshelf = require('bookshelf').conexaoMain;
var util = require('./util');

var Configuracao = Bookshelf.Model.extend({
    tableName: 'configuracao',
    idAttribute: 'id_configuracao'
},{

  getConfiguracoes: function(){

    var tempos = [];

    tempos.push({atribute: '60', value: 2.00});
    tempos.push({atribute: '120', value: 4.00});
    tempos.push({atribute: '180', value: 6.00});
    tempos.push({atribute: '180', value: 8.00});


    return tempos;
  }



});

module.exports = Configuracao;