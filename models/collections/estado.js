var Bookshelf = require('bookshelf').conexaoMain;
var Estado = require("../models/estado");

module.export = Bookshelf.Collection.extend({
    model: Estado.Estado
});