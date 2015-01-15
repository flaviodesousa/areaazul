var Bookshelf = require('bookshelf').conexaoMain;

var Fiscalizacao = Bookshelf.Model.extend({
    tableName: 'fiscalizacao',
    idAttribute: 'id_fiscalizacao'
});

exports.Fiscalizacao = Fiscalizacao;