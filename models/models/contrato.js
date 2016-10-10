const Bookshelf = require('../../database');

var Contrato = Bookshelf.Model.extend({
  tableName: 'contrato'
});
Bookshelf.model('Contrato', Contrato);

exports.Contrato = Contrato;
