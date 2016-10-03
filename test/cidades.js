'use strict';

var should = require('chai').should();

const AreaAzul = require('../areaazul');
const Bookshelf = AreaAzul.db;

var CidadesCollection = Bookshelf.collection('Cidades');

describe('collections.Cidades', function() {
  var idEstado = 1;
  describe('listar()', function() {
    it('lista cidades do estado 1', function(done) {
      CidadesCollection
        .listar(idEstado)
        .then(function(cidadesCollection) {
          should.exist(cidadesCollection);
          var cidades = cidadesCollection.toJSON();
          cidades.should.be.instanceOf(Array);
          cidades.length.should.not.be.equal(0);
          cidades[0].should.have.property('estado');
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
    it('falha com id estado invalido', function(done) {
      CidadesCollection
        .listar('undefined')
        .then(function() {
          done(new Error('não deveria aceitar id inválido'));
        })
        .catch(AreaAzul.BusinessException, function(err) {
          should.exist(err);
          err.should.have.property('details');
          err.details.should.have.property('idEstado', 'undefined');
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
    it('lista todas cidades se idEstado não fornecido', function(done) {
      CidadesCollection
        .listar()
        .then(function(cidadesCollection) {
          should.exist(cidadesCollection);
          var cidades = cidadesCollection.toJSON();
          cidades.should.be.instanceOf(Array);
          cidades.length.should.not.be.equal(0);
          cidades[0].should.have.property('estado');
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });
});
