const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;

var Contrato = Bookshelf.Model.extend({
  tableName: 'contrato'
});
Bookshelf.model('Contrato', Contrato);

exports.Contrato = Contrato;
