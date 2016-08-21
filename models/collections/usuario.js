'use strict';

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const Usuario = Bookshelf.model('Usuario');

var Usuarios = Bookshelf.Collection.extend({
  model: Usuario
}, {

  listar: function(then, fail) {
    Usuarios
      .forge()
      .query(function(qb) {
        qb.join('pessoa', 'pessoa.id_pessoa', 'usuario.pessoa_id')
          .join('pessoa_fisica', 'pessoa_fisica.pessoa_id', 'pessoa.id_pessoa')
          .where('usuario.ativo', '=', 'true')
          .select('usuario.*')
          .select('pessoa.*')
          .select('pessoa_fisica.*');
      })
      .fetch()
      .then(function(collection) {
        then(collection);
      })
      .catch(function(err) {
      fail(err);
    });
  }

});
Bookshelf.model('Usuarios', Usuarios);

module.export = Usuarios;
