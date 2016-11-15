'use strict';

const Bookshelf = require('../../database');

const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');

const UsuariosRevendedores = Bookshelf.Collection.extend({
  model: UsuarioRevendedor
}, {
});
Bookshelf.collection('UsuariosRevendedores', UsuariosRevendedores);

module.exports = UsuariosRevendedores;
