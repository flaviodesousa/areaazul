var Bookshelf = require('bookshelf').conexaoMain;
var PessoaFisica = require("../models/pessoafisica");

module.exports = Bookshelf.Collection.extend({
    model: PessoaFisica.PessoaFisica
});