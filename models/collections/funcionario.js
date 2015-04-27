var Bookshelf = require('bookshelf').conexaoMain;
var Funcionario = require("../models/funcionario");

module.exports = Bookshelf.Collection.extend({
    model: Funcionario.Funcionario
});