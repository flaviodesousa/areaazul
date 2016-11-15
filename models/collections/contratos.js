const Bookshelf = require('../../database');
const Contrato = Bookshelf.model('Contrato');

const Contratos = Bookshelf.Collection.extend({
  model: Contrato.Contrato
});
Bookshelf.collection('Contratos', Contratos);

module.exports = Contratos;
