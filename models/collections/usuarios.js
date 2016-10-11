'use strict';

const Bookshelf = require('../../database');
const Usuario = Bookshelf.model('Usuario');

var Usuarios = Bookshelf.Collection.extend({
  model: Usuario
}, {
});
Bookshelf.collection('Usuarios', Usuarios);

module.export = Usuarios;
