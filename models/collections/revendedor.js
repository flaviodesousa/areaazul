var Bookshelf = require('bookshelf').conexaoMain;
var Revendedor = require("../models/models/revendedor");

module.export = Bookshelf.Collection.extend({
    model: Revendedor.Revendedor
});