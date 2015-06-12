var Bookshelf = require('bookshelf').conexaoMain;
var Ativacao = require('../models/ativacao');

module.exports = Bookshelf.Collection.extend({
  model: Ativacao,
});
