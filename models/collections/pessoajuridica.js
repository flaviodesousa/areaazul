var Bookshelf = require('bookshelf').conexaoMain;
var PessoaJuridica = require("../models/pessoajuridica");

module.exports = Bookshelf.Collection.extend({
    model: PessoaJuridica.PessoaJuridica
});