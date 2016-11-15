const Bookshelf = require('../../database');
const UsuarioFiscal = Bookshelf.model('UsuarioFiscal');

const UsuariosFiscais = Bookshelf.Collection.extend({
  model: UsuarioFiscal
});
Bookshelf.collection('UsuariosFiscais', UsuariosFiscais);

module.exports = UsuariosFiscais;
