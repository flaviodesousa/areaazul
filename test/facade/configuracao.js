'use strict';

const debug = require('debug')('areaazul:test:configuracao');
const should = require('chai').should();

const AreaAzul = require('../../areaazul');
const Configuracao = AreaAzul.facade.Configuracao;

describe('fachada Configuracao', function() {
  let idCidade = null;

  before(function() {
    const TestHelpers = require('../../test-helpers')(AreaAzul);
    return TestHelpers
      .pegarCidade()
      .then(function(cidade) {
        idCidade = cidade.id;
      });
  });

  describe('buscar()', function() {
    it('busca', function(done) {
      Configuracao.buscar()
        .then(function(configuracao) {
          should.exist(configuracao);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('alterar()', function() {
    it('alterar as configurações', function(done) {
      const config = {
        valor_ativacao_reais: '1.20',
        tempo_tolerancia_minutos: '16',
        franquia_minutos: '10',
        ciclo_ativacao_minutos: '70',
        ciclo_fiscalizacao_minutos: '60',
        cidade_id: idCidade
      };
      Configuracao.alterar(config)
        .then(function(configuracao) {
          should.exist(configuracao);
          configuracao.should.have.property('valor_ativacao_reais', '1.20');
          configuracao.should.have
            .property('tempo_tolerancia_minutos', '16');
          configuracao.should.have.property('franquia_minutos', '10');
          configuracao.should.have.property('ciclo_ativacao_minutos', '70');
          configuracao.should.have
            .property('ciclo_fiscalizacao_minutos', '60');
          configuracao.should.have.property('cidade_id');
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });
});
