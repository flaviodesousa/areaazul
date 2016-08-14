'use strict';

var AreaAzul = require('../../areaazul.js');
var Bookshelf = AreaAzul.db.Bookshelf.conexaoMain;
var Usuario = require('../models/usuario');

var UsuarioCollection = Bookshelf.Collection.extend({
  model: Usuario
}, {

  listar: function(then, fail) {
    UsuarioCollection
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