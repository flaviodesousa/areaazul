const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;

const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');

var UsuariosRevendedores = Bookshelf.Collection.extend({
  model: UsuarioRevendedor
}, {
  listarUsuarioRevenda: function(idRevendedor) {
    return this
    .forge()
    .query(function(qb) {
      qb
        .distinct()
        .innerJoin('pessoa_fisica',
          'pessoa_fisica.pessoa_id', 'usuario_revendedor.pessoa_id')
        .innerJoin('pessoa', 'pessoa.id_pessoa', 'pessoa_fisica.pessoa_id')
        .where('usuario_revendedor.revendedor_id', idRevendedor)
        .select('pessoa_fisica.*')
        .select('pessoa.*')
        .select('usuario_revendedor.*');
    })
    .fetch();
  },
});
Bookshelf.model('UsuariosRevendedores', UsuariosRevendedores);

module.exports = UsuariosRevendedores;
