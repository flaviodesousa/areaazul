'use strict';

const Bookshelf = require('../../database');

var Cidade = Bookshelf.Model.extend({
  tableName: 'cidade',
  estado: function() {
    return this.belongsTo('Estado', 'estado_id');
  }
}, {});
Bookshelf.model('Cidade', Cidade);

module.exports = Cidade;
