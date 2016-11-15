'use strict';

const Bookshelf = require('../../database');

const Estado = Bookshelf.Model.extend({
  tableName: 'estado'
}, {
  procurar: function(id) {
    return new Estado({ id: id })
      .fetch();
  }

});
Bookshelf.model('Estado', Estado);

module.exports = Estado;


