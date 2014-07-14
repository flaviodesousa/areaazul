var Bookshelf = require('bookshelf').conexaoMain;
var PessoaJuridica = require("../models/pessoajuridica");

module.export = Bookshelf.Collection.extend({
    model: PessoaJuridica.PessoaJuridica
});