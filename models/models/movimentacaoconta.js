var Bookshelf = require('bookshelf').conexaoMain;

var MovimentacaoConta = Bookshelf.Model.extend({
    tableName: 'movimentacao_conta',
    idAttribute: 'id'
});

exports.MovimentacaoConta = MovimentacaoConta;