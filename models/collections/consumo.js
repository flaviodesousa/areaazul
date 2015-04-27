var Bookshelf = require('bookshelf').conexaoMain;
var Consumo = require("../models/consumo");

module.exports = Bookshelf.Collection.extend({
    model: Consumo.Consumo
});