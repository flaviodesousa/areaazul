var Bookshelf = require('bookshelf').conexaoMain;
var PessoaFisica = require("../models/pessoa_fisica");

module.exports = Bookshelf.Collection.extend({
    model: PessoaFisica.PessoaFisica
});