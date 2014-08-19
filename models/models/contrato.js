var Bookshelf = require('bookshelf').conexaoMain;

var Contrato = Bookshelf.Model.extend({
    tableName: 'contrato',
    idAttribute: 'id_contrato'
});

exports.Contrato = Contrato;