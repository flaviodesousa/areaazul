'use strict';

var Bookshelf = require('bookshelf').conexaoMain;

var Cidade =  Bookshelf.Model.extend({
  tableName: 'cidade',
  idAttribute: 'id_cidade',
  estado: function() {
    return this.belongsTo(require('./estado'), 'estado_id');
  },
}, {
});

module.exports = Cidade;
