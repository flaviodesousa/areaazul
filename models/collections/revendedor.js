var Bookshelf = require('bookshelf').conexaoMain;
var Revendedor = require("../models/revendedor");

module.export = Bookshelf.Collection.extend({
    model: Revendedor.Revendedor
});