'use strict';

const Bookshelf = require('../../database');

var Configuracao = Bookshelf.Model.extend(
  {
    tableName: 'configuracao'
  }, {
})
;
Bookshelf.model('Configuracao', Configuracao);

module.exports = Configuracao;
