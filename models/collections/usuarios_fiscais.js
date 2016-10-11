const Bookshelf = require('../../database');
const UsuarioFiscal = Bookshelf.model('UsuarioFiscal');

var UsuariosFiscais = Bookshelf.Collection.extend({
  model: UsuarioFiscal
});
Bookshelf.collection('UsuariosFiscais', UsuariosFiscais);

module.exports = UsuariosFiscais;
