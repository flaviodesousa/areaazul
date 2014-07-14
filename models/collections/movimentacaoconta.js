var Bookshelf = require('bookshelf').conexaoMain;
var MovimentacaoConta = require("../models/movimentacaoconta");

module.export = Bookshelf.Collection.extend({
    model: MovimentacaoConta.MovimentacaoConta
});