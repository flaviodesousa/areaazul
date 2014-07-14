var Bookshelf = require('bookshelf').conexaoMain;
var Conta = require("../models/conta");

module.export = Bookshelf.Collection.extend({
    model: Conta.Conta
});