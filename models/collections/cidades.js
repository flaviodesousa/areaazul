'use strict';

var Bookshelf = require('../../database');
var Cidade = Bookshelf.model('Cidade');

var Cidades = Bookshelf.Collection.extend({
  model: Cidade
}, {
});
Bookshelf.collection('Cidades', Cidades);
