var Bookshelf = require('bookshelf').conexaoMain;
var Conta = require("../models/conta").Conta;

module.exports = Bookshelf.Collection.extend({
  model: Conta
});
