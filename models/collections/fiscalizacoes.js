var Bookshelf = require('bookshelf').conexaoMain;
var Fiscalizacao = require("../models/movimentacaoconta");

module.exports = Bookshelf.Collection.extend({
    model: Fiscalizacao.Fiscalizacao
});