var Bookshelf = require('bookshelf').conexaoMain;
var Revendedor = require("../models/evendedor");

module.export = Bookshelf.Collection.extend({
    model: Revendedor.Revendedor
});