'use strict';

const should = require('chai').should();

const AreaAzul = require('../areaazul');
const Cidade = AreaAzul.facade.Cidade;

describe('fachada Cidade', function() {
  var idEstado = 1;
  var contagemCidadesDoEstado1 = 0;
  describe('listar()', function() {
    it('lista cidades do estado 1', function(done) {
      Cidade
        .listar(idEstado)
        .then(function(cidades) {
          should.exist(cidades);
          cidades.should.be.instanceOf(Array);
          cidades.length.should.not.be.equal(0);
          contagemCidadesDoEstado1 = cidades.length;
          cidades[0].should.have.property('estado');
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
    it('falha com id estado invalido', function(done) {
      Cidade
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
      Cidade
        .listar()
        .then(function(cidades) {
          should.exist(cidades);
          cidades.should.be.instanceOf(Array);
          cidades.length.should.be.greaterThan(contagemCidadesDoEstado1);
          cidades[0].should.have.property('estado');
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });
});
