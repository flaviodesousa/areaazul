var Bookshelf = require('bookshelf').conexaoMain;
var Estado = require("../models/estado");

module.exports = Bookshelf.Collection.extend({
    model: Estado.Estado
});