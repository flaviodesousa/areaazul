var Bookshelf = require('bookshelf').conexaoMain;
var Fiscalizacao = require("../models/movimentacaoconta");

module.export = Bookshelf.Collection.extend({
    model: Fiscalizacao.Fiscalizacao
});