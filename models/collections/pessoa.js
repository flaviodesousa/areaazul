var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require("../models/pessoa");

module.exports = Bookshelf.Collection.extend({
    model: Pessoa.Pessoa
});