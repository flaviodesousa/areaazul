var Bookshelf = require('bookshelf').conexaoMain;

var Conta = Bookshelf.Model.extend({
    tableName: 'conta',
    idAttribute: 'id'
});

exports.Conta = Conta;