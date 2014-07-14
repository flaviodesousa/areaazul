var Bookshelf = require('bookshelf').conexaoMain;
var Configuracao = require("../models/configuracao");

module.export = Bookshelf.Collection.extend({
    model: Configuracao.Configuracao
});