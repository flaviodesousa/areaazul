var Bookshelf = require('bookshelf').conexaoMain;
var Configuracao = require("./models/models/configuracao");

module.export = Bookshelf.Collection.extend({
    model: Configuracao.Configuracao
});