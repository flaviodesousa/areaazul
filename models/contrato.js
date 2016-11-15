const Bookshelf = require('../database');

const Contrato = Bookshelf.Model.extend({
  tableName: 'contrato'
});
Bookshelf.model('Contrato', Contrato);

const Contratos = Bookshelf.Collection.extend({
  model: Contrato.Contrato
});
Bookshelf.collection('Contratos', Contratos);
