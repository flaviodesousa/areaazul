var Bookshelf = require('bookshelf').conexaoMain;
var Ativacao = require("../models/ativacao");

module.export = Bookshelf.Collection.extend({
    model: Ativacao.Ativacao
});