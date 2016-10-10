const Bookshelf = require('../../database');
var Contrato = Bookshelf.model('Contrato');

var Contratos = Bookshelf.Collection.extend({
  model: Contrato.Contrato
});
Bookshelf.collection('Contratos', Contratos);

module.exports = Contratos;
