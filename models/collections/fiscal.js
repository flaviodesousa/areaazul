var Bookshelf = require('bookshelf').conexaoMain;
var Fiscal = require("../models/models/fiscal");

module.export = Bookshelf.Collection.extend({
    model: Fiscal.Fiscal
});