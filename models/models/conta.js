var Bookshelf = require('bookshelf').conexaoMain;

var Conta = Bookshelf.Model.extend({
    tableName: 'conta',
    idAttribute: 'id_conta'
});

exports.Conta = Conta;