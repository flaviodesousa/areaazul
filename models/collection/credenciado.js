var Bookshelf = require('bookshelf').conexaoMain;
var Credenciado = require("../models/models/credenciado");

module.export = Bookshelf.Collection.extend({
    model: Credenciado.Credenciado
});