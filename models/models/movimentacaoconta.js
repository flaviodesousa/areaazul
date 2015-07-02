var Bookshelf = require('bookshelf').conexaoMain;

var MovimentacaoConta = Bookshelf.Model.extend({
    tableName: 'movimentacao_conta',
    idAttribute: 'id_movimentacao_conta'
},{



});

module.exports = MovimentacaoConta;