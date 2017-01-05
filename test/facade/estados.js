'use strict';

const should = require('chai').should();

const AreaAzul = require('../../areaazul');
const Estado = AreaAzul.facade.Estado;

describe('fachada Estado', function() {

  describe('listar()', function() {
    it('obtém lista em ordem alfabética', function(done) {
      Estado
        .listar()
        .then(function(estados) {
          should.exist(estados);
          estados.should.be.an.instanceOf(Array);
          estados.length.should.be.greaterThan(20);
          estados[0].should.have.property('id');
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });

  });

});
