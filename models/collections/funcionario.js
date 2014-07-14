var Bookshelf = require('bookshelf').conexaoMain;
var Funcionario = require("../models/funcionario");

module.export = Bookshelf.Collection.extend({
    model: Funcionario.Funcionario
});