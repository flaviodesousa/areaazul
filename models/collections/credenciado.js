var Bookshelf = require('bookshelf').conexaoMain;
var Credenciado = require("../models/credenciado");

module.exports = Bookshelf.Collection.extend({
    model: Credenciado.Credenciado
});