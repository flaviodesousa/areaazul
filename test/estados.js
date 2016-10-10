'use strict';

const should = require('chai').should();
const Bookshelf = require('../database');
const Estados = Bookshelf.collection('Estados');

describe('collection Estados', function() {

  describe('listar()', function() {

    it('obtém lista em ordem alfabética', function(done) {
      Estados
        .listar()
        .then(function(listaDeEstados) {
          should.exist(listaDeEstados);
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });

  });

});
