'use strict';

var should = require('chai').should();
var TestHelpers = require('../helpers/test');
var AreaAzul = require('../areaazul');
var Bookshelf = require('bookshelf').conexaoMain;
var CidadesCollection = Bookshelf.collection('Cidades');
var Cidade = Bookshelf.model('Cidade');

describe('collections.Cidades', function() {
  var idEstado = 1;
  describe('listar()', function() {
    it('lista cidades do estado 1', function(done) {
      CidadesCollection
        .listar(idEstado)
        .then(function() {
          done();
        });
    });
    it('falha com id estado invalido', function(done) {
      CidadesCollection
        .listar('undefined')
        .then(function() {
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });
});
