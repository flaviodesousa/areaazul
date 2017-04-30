'use strict';

const Bookshelf = require('../database');

const Estado = Bookshelf.Model.extend({
  tableName: 'estado'
}, {


  procurar: function(id) {
    return new Estado({ id: id })
      .fetch();
  }


});

Bookshelf.model('Estado', Estado);

const Estados = Bookshelf.Collection.extend({
  model: Estado
}, {});

Bookshelf.collection('Estados', Estados);
