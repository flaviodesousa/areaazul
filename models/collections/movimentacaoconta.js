var Bookshelf = require('bookshelf').conexaoMain;
var MovimentacaoConta = require("../models/movimentacaoconta");

module.exports = Bookshelf.Collection.extend({
    model: MovimentacaoConta
});