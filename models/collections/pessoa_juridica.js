var Bookshelf = require('bookshelf').conexaoMain;
var PessoaJuridica = require("../models/pessoa_juridica");

module.exports = Bookshelf.Collection.extend({
    model: PessoaJuridica.PessoaJuridica
});