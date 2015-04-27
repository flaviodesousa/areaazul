var Bookshelf = require('bookshelf').conexaoMain;
var Revendedor = require("../models/revendedor");

module.exports = Bookshelf.Collection.extend({
    model: Revendedor.Revendedor
});