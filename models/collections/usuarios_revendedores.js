'use strict';

const Bookshelf = require('../../database');

const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');

var UsuariosRevendedores = Bookshelf.Collection.extend({
  model: UsuarioRevendedor
}, {
});
Bookshelf.collection('UsuariosRevendedores', UsuariosRevendedores);

module.exports = UsuariosRevendedores;
