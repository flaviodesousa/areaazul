'use strict';

const debug = require('debug')('areaazul:teste:cidade');
const should = require('chai').should();

const AreaAzul = require('../areaazul');
const Cidade = AreaAzul.facade.Cidade;

describe('fachada Cidade', function() {
  var idEstado = 1;
  var cidade1000;
  var contagemCidadesDoEstado1 = 0;
  describe('listar()', function() {
    it('lista cidades do estado 1', function(done) {
      Cidade
        .listar({ idEstado: idEstado })
        .then(function(cidades) {
          should.exist(cidades);
          cidades.should.be.instanceOf(Array);
          cidades.length.should.not.be.equal(0);
          contagemCidadesDoEstado1 = cidades.length;
          cidades[0].should.have.property('estado');
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('falha com id estado invalido', function(done) {
      Cidade
        .listar({ idEstado: 'undefined' })
        .then(function() {
          done(new Error('não deveria aceitar id inválido'));
        })
        .catch(AreaAzul.BusinessException, function(err) {
          should.exist(err);
          err.should.have.property('details');
          err.details.should.have.property('filtro');
          err.details.filtro.should.have.property('idEstado', 'undefined');
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('lista todas cidades se idEstado não fornecido', function(done) {
      Cidade
        .listar()
        .then(function(cidades) {
          should.exist(cidades);
          cidades.should.be.instanceOf(Array);
          cidades.length.should.be.greaterThan(1001);
          cidade1000 = cidades[1000];
          cidades[0].should.have.property('estado');
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('lista todas cidades com termo', function(done) {
      Cidade
        .listar({ termos: '  São  Mig  ' })
        .then(function(cidades) {
          should.exist(cidades);
          cidades.should.be.instanceOf(Array);
          cidades.length.should.be.greaterThan(contagemCidadesDoEstado1);
          cidades[0].should.have.property('estado');
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });
  describe('buscarPorID()', function() {
    it('obtém cidade existente pelo id', function(done) {
      Cidade
        .buscarPorId(cidade1000.id)
        .then(cidade => {
          should.exist(cidade);
          cidade.should.have.property('id', cidade1000.id);
          cidade.should.have.property('nome', cidade1000.nome);
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });
});
