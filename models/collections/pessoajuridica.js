var Bookshelf = require('bookshelf').conexaoMain;
var PessoaJuridica = require("../models/models/pessoajuridica");

module.export = Bookshelf.Collection.extend({
    model: PessoaJuridica.PessoaJuridica
});