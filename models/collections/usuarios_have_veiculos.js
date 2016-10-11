const Bookshelf = require('../../database');
const UsuarioHasVeiculo = Bookshelf.model('UsuarioHasVeiculo');

var UsuariosHaveVeiculos = Bookshelf.Collection.extend({
  model: UsuarioHasVeiculo
}, {
});
Bookshelf.collection('UsuariosHaveVeiculos', UsuariosHaveVeiculos);

module.exports = UsuariosHaveVeiculos;
