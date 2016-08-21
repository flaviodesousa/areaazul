var AreaAzul = require('../../areaazul');
var Bookshelf = require('bookshelf').conexaoMain;
var Conta = Bookshelf.model('Conta');

var Contas = Bookshelf.Collection.extend({
  model: Conta
});
Bookshelf.collection('Contas', Contas);

module.exports = Contas;
