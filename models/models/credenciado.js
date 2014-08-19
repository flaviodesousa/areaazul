var Bookshelf = require('bookshelf').conexaoMain;

var Credenciado = Bookshelf.Model.extend({
    tableName: 'credenciado',
    idAttribute: 'id_credenciado'
});

exports.Credenciado = Credenciado;