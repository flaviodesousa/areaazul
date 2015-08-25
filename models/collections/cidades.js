'use strict';

var Bookshelf = require('bookshelf').conexaoMain;
var Cidade = require("../models/cidade");

module.exports = Bookshelf.Collection.extend({
  model: Cidade
});
