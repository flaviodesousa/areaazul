'use strict';

const should = require('chai').should();

const AreaAzul = require('../areaazul');
const Estado = AreaAzul.facade.Estado;

describe('fachada Estado', function() {

  describe('listar()', function() {

    it('obtém lista em ordem alfabética', function(done) {
      Estado
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
