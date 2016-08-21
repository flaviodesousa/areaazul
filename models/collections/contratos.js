const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
var Contrato = Bookshelf.model('Contrato');

var Contratos = Bookshelf.Collection.extend({
  model: Contrato.Contrato
});
Bookshelf.collection('Contratos', Contratos);

module.exports = Contratos;
