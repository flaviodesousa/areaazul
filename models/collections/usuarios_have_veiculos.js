const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const UsuarioHasVeiculo = Bookshelf.model('UsuarioHasVeiculo');

var UsuariosHaveVeiculos = Bookshelf.Collection.extend({
  model: UsuarioHasVeiculo,
}, {
  listarVeiculos: function(user) {
    return UsuariosHaveVeiculos
      .forge()
      .query(function(qb) {
        qb
          .innerJoin('usuario', 'usuario.id',
            'usuario_has_veiculo.usuario_pessoa_id')
          .innerJoin('pessoa', 'pessoa.id', 'usuario.id')
          .innerJoin('pessoa_fisica', 'pessoa_fisica.id', 'pessoa.id')
          .innerJoin('veiculo', 'veiculo.id', 'usuario_has_veiculo.veiculo_id')
          .where('usuario.id', user)
          .select('veiculo.*');
      })
      .fetch();
}

});
Bookshelf.collection('UsuariosHaveVeiculos', UsuariosHaveVeiculos);

module.exports = UsuariosHaveVeiculos;
