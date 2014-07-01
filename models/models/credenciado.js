var Bookshelf = require('bookshelf').conexaoMain;

var Credenciado = Bookshelf.Model.extend({
    tableName: 'credenciado',
    idAttribute: 'id'
});

exports.Credenciado = Credenciado;