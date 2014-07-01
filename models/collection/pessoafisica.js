var Bookshelf = require('bookshelf').conexaoMain;
var PessoaFisica = require("../models/pessoafisica");

module.export = Bookshelf.Collection.extend({
    model: PessoaFisica.PessoaFisica
});