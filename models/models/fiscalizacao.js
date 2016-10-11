'use strict';

const Bookshelf = require('../../database');

var Fiscalizacao = Bookshelf.Model.extend({
  tableName: 'fiscalizacao'
}, {
});
Bookshelf.model('Fiscalizacao', Fiscalizacao);

module.exports = Fiscalizacao;
