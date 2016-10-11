'use strict';

const Bookshelf = require('../../database');
var Fiscalizacao = Bookshelf.model('Fiscalizacao');

var Fiscalizacoes = Bookshelf.Collection.extend({
  model: Fiscalizacao
}, {
});
Bookshelf.collection('Fiscalizacoes', Fiscalizacoes);

module.exports = Fiscalizacoes;
