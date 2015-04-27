var Bookshelf = require('bookshelf').conexaoMain;
var Contrato = require("../models/contrato");

module.exports = Bookshelf.Collection.extend({
    model: Contrato.Contrato
});