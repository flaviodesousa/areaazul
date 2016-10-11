'use strict';

const Bookshelf = require('../../database');
var Estado = Bookshelf.model('Estado');

var Estados = Bookshelf.Collection.extend({
  model: Estado
}, {
});
Bookshelf.collection('Estados', Estados);

module.exports = Estados;
