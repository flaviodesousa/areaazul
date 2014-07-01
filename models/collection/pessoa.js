var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require("../models/pessoa");

module.export = Bookshelf.Collection.extend({
    model: Pessoa.Pessoa
});