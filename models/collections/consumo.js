var Bookshelf = require('bookshelf').conexaoMain;
var Consumo = require("../models/consumo");

module.export = Bookshelf.Collection.extend({
    model: Consumo.Consumo
});