var Bookshelf = require('bookshelf').conexaoMain;
var Contrato = require("../models/models/contrato");

module.export = Bookshelf.Collection.extend({
    model: Contrato.Contrato
});