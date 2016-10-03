'use strict';

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;

var Cidade = Bookshelf.Model.extend({
  tableName: 'cidade',
  estado: function() {
    return this.belongsTo('Estado', 'estado_id');
  }
}, {});
Bookshelf.model('Cidade', Cidade);

module.exports = Cidade;
