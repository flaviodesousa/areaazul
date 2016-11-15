'use strict';

const Bookshelf = require('../../database');
const Usuario = Bookshelf.model('Usuario');

const Usuarios = Bookshelf.Collection.extend({
  model: Usuario
}, {
});
Bookshelf.collection('Usuarios', Usuarios);

module.export = Usuarios;
