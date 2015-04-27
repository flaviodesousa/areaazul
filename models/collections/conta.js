var Bookshelf = require('bookshelf').conexaoMain;
var Conta = require("../models/conta");

module.exports = Bookshelf.Collection.extend({
    model: Conta.Conta
});