const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;

const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');

var UsuariosRevendedores = Bookshelf.Collection.extend({
  model: UsuarioRevendedor
}, {
  listarUsuarioRevenda: function(idRevendedor) {
    return new UsuariosRevendedores()
      .where({ id_revendedor: idRevendedor });
  },
});
Bookshelf.collection('UsuariosRevendedores', UsuariosRevendedores);

module.exports = UsuariosRevendedores;
