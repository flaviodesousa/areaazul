'use strict';

const Bookshelf = require('../../database');
const Estado = Bookshelf.model('Estado');

const Estados = Bookshelf.Collection.extend({
  model: Estado
}, {
});
Bookshelf.collection('Estados', Estados);

module.exports = Estados;
