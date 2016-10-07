'use strict';

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;

var Estado = Bookshelf.Model.extend({
  tableName: 'estado'
}, {
  procurar: function(id) {
    return new Estado({ id: id })
      .fetch();
  }

});
Bookshelf.model('Estado', Estado);

module.exports = Estado;


