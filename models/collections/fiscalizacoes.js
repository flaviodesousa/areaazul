'use strict';

const Bookshelf = require('../../database');
const Fiscalizacao = Bookshelf.model('Fiscalizacao');

const Fiscalizacoes = Bookshelf.Collection.extend({
  model: Fiscalizacao
}, {
});
Bookshelf.collection('Fiscalizacoes', Fiscalizacoes);

module.exports = Fiscalizacoes;
