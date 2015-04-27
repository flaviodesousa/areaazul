var Bookshelf = require('bookshelf').conexaoMain;
var Veiculo = require("../models/veiculo");

module.exports = Bookshelf.Collection.extend({
    model: Veiculo.Veiculo
});