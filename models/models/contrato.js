const Bookshelf = require('../../database');

const Contrato = Bookshelf.Model.extend({
  tableName: 'contrato'
});
Bookshelf.model('Contrato', Contrato);

exports.Contrato = Contrato;
