var Bookshelf = require('bookshelf').conexaoMain;
var Veiculo = require("../models/models/veiculo");

module.export = Bookshelf.Collection.extend({
    model: Veiculo.Veiculo
});