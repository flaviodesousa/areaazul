var Bookshelf = require('bookshelf').conexaoMain;
var UsuarioRevendedor = require("../models/usuario_revendedor");


var UsuarioRevendedorCollection = Bookshelf.Collection.extend({
  model: UsuarioRevendedor,
}, {
  listarUsuarioRevenda: function(revendedor_id, func, err) {
    this
    .forge()
    .query(function(qb) {
      qb.where('revendedor_id', '=', revendedor_id);
      qb.select('usuario_revendedor.*');
    })
    .fetch()
    .then(function(collection) {
      func(collection);
    })
    .catch(function(e) {
      err(e);
    });
    
  },
});

module.exports = UsuarioRevendedorCollection;