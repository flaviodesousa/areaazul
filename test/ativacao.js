'use strict';

var debug = require('debug')('areaazul:test:ativacao');
var should = require('chai').should();

const AreaAzul = require('../areaazul');
const Bookshelf = AreaAzul.db;

const TestHelpers = require('areaazul-test-helpers')(AreaAzul);

var Ativacao = Bookshelf.model('Ativacao');
const AtivacaoUsuario = Bookshelf.model('AtivacaoUsuario');
const Conta = Bookshelf.model('Conta');
var Ativacoes = Bookshelf.collection('Ativacoes');

const valorTeste = 10;

describe('model.ativacao', function() {

  var idUsuarioComum = null;
  var veiculoExistente = null;
  const placaVeiculoNovo = 'TAT1540';
  var idCidade = null;
  var idUsuarioRevendedor = null;
  var idAtivacao = null;

  before(function() {
    return TestHelpers
      .pegarVeiculo()
      .then(function(v) {
        veiculoExistente = v;
        return TestHelpers
          .apagarVeiculoPorPlaca(placaVeiculoNovo);
      })
      .then(function() {
        return TestHelpers.pegarUsuario();
      })
      .then(function(usuario) {
        idUsuarioComum = usuario.id;
        return new Conta({ id: usuario.get('conta_id') })
          .fetch();
      })
      .then(function(contaUsuario) {
        return TestHelpers.setSaldo(contaUsuario, valorTeste);
      })
      .then(function() {
        return TestHelpers.pegarRevendedor();
      })
      .then(function(revendedor) {
        return new Conta({ id: revendedor.get('conta_id') })
          .fetch();
      })
      .then(function(contaRevendedor) {
        return TestHelpers.setSaldo(contaRevendedor, valorTeste);
      })
      .then(function() {
        return TestHelpers.pegarUsuarioRevendedor();
      })
      .then(function(usuarioRevendedor) {
        idUsuarioRevendedor = usuarioRevendedor.id;
      })
      .then(function() {
        return TestHelpers.pegarCidade();
      })
      .then(function(cidade) {
        idCidade = cidade.id;
      })
      .then(function() {
        // Apagar ativações pendentes, para não afetar testes com novas
        // ativações.
        return AtivacaoUsuario
          .query(function(qb) {
            qb
              .whereExists(function() {
                this.select('*').from('ativacao')
                  .whereRaw('ativacao.id=ativacao_usuario.ativacao_id'
                    + ' and ativacao.data_desativacao is null');
              });
          })
          .destroy();
      })
      .then(function() {
        return Ativacao
          .query(function(qb) {
            qb
              .whereNull('data_desativacao')
              .andWhere({ veiculo_id: veiculoExistente.id });
          })
          .destroy();
      })
      .catch(function(e) {
        debug('erro inesperado na before()', e);
        throw e;
      });
  });

  describe('Ativar()', function() {

    it('grava ativacao', function(done) {
      var ativacao = {
        usuario_id: idUsuarioComum,
        veiculo_id: veiculoExistente.id,
        valor: valorTeste
      };

      Ativacao
        .ativar(ativacao)
        .then(function(at) {
          should.exist(at);
          should.exist(at.id);
          idAtivacao = at.id;
          done();
        })
        .catch(function(e) {
          debug('erro inesperado na ativacao', e);
          done(e);
        });
    });
  });

  describe('desativar()', function() {

    it('falha para ativacao inexistente', function(done) {
      Ativacao
        .desativar({
          ativacao_id: 0,
          usuario_id: idUsuarioComum
        })
        .then(function() {
          done('Nao deveria ter desativado uma ativacao inexistente');
        })
        .catch(function(e) {
          should.exist(e);
          done();
        });
    });

    it('falha se usuario diferente do ativador', function(done) {
      Ativacao
        .desativar({
          ativacao_id: idAtivacao,
          usuario_id: 0
        })
        .then(function() {
          done('Nao deveria ter desativado com usuario diferente');
        })
        .catch(function(e) {
          should.exist(e);
          done();
        });
    });

    it('desativa ativacao existente', function(done) {
      Ativacao
        .desativar({
          ativacao_id: idAtivacao,
          usuario_id: idUsuarioComum
        })
        .then(function() {
          done();
        })
        .catch(function(e) {
          debug('erro inesperado na desativacao', e);
          done(e);
        });
    });
  });

  describe('ativarPelaRevenda()', function() {
    it('falha com ativacao revenda sem usuario revendedor', function(done) {
      Ativacao
        .ativarPelaRevenda({
          cidade: idCidade,
          placa: veiculoExistente.get('placa'),
          marca: veiculoExistente.get('marca'),
          modelo: veiculoExistente.get('modelo'),
          cor: veiculoExistente.get('cor'),
          tipo_veiculo: veiculoExistente.get('tipo'),
          tempo: 60,
          valor: valorTeste
        })
        .then(function() {
          done(new Error('Não deve ativar sem usuário de revenda'));
        })
        .catch(AreaAzul.BusinessException, function(e) {
          should.exist(e);
          should.exist(e.details);
          e.details.should.be.an('array');
          e.details.length.should.be.greaterThan(0);
          done();
        })
        .catch(e => {
          debug('erro inesperado na ativacao pela revenda', e);
          done(e);
        });
    });

    it('falha com ativacao revenda com usuario inválido', function(done) {
      Ativacao
        .ativarPelaRevenda({
          usuario_revendedor_id: 'a',
          cidade: idCidade,
          placa: veiculoExistente.get('placa'),
          marca: veiculoExistente.get('marca'),
          modelo: veiculoExistente.get('modelo'),
          cor: veiculoExistente.get('cor'),
          tipo_veiculo: veiculoExistente.get('tipo'),
          tempo: 60,
          valor: valorTeste
        })
        .then(function() {
          done(new Error('Não deve ativar sem usuário de revenda'));
        })
        .catch(AreaAzul.BusinessException, e => {
          should.exist(e);
          should.exist(e.details);
          e.details.should.be.an('array');
          e.details.length.should.be.greaterThan(0);
          done();
        })
        .catch(e => {
          debug('erro inesperado na ativação pela revenda', e);
          done(e);
        });
    });

    it('falha com ativacao revenda com usuário inexistente', function(done) {
      Ativacao
        .ativarPelaRevenda({
          usuario_revendedor_id: 0,
          cidade: idCidade,
          placa: veiculoExistente.get('placa'),
          marca: veiculoExistente.get('marca'),
          modelo: veiculoExistente.get('modelo'),
          cor: veiculoExistente.get('cor'),
          tipo_veiculo: veiculoExistente.get('tipo'),
          tempo: 60,
          valor: valorTeste
        })
        .then(function() {
          done(new Error('Não deve ativar sem usuário de revenda'));
        })
        .catch(AreaAzul.BusinessException, function(e) {
          should.exist(e);
          should.exist(e.details);
          e.details.should.be.an('array');
          e.details.length.should.be.greaterThan(0);
          done();
        })
        .catch(e => {
          debug('erro inesperado na ativacao pela revenda', e);
          done(e);
        });
    });

    it('falha com ativacao revenda sem cidade', function(done) {
      Ativacao
        .ativarPelaRevenda({
          usuario_revendedor_id: idUsuarioRevendedor,
          placa: placaVeiculoNovo,
          marca: veiculoExistente.get('marca'),
          modelo: veiculoExistente.get('modelo'),
          cor: veiculoExistente.get('cor'),
          tipo_veiculo: veiculoExistente.get('tipo'),
          tempo: 60,
          valor: valorTeste
        })
        .then(function() {
          done(new Error('Não deve ativar veículo sem cidade'));
        })
        .catch(AreaAzul.BusinessException, function(e) {
          should.exist(e);
          should.exist(e.details);
          e.details.should.be.an('array');
          e.details.length.should.be.greaterThan(0);
          done();
        })
        .catch(e => {
          debug('erro inesperado na ativacao pela revenda', e);
          done(e);
        });
    });

    it('grava ativacao', function(done) {
      Ativacao
        .ativarPelaRevenda({
          usuario_revendedor_id: idUsuarioRevendedor,
          cidade: idCidade,
          placa: veiculoExistente.get('placa'),
          marca: veiculoExistente.get('marca'),
          modelo: veiculoExistente.get('modelo'),
          cor: veiculoExistente.get('cor'),
          tipo_veiculo: veiculoExistente.get('tipo'),
          tempo: 60,
          valor: valorTeste
        })
        .then(function(ativacao) {
          return ativacao
            .destroy()
            .then(function() {
              done();
            });
        })
        .catch(function(e) {
          debug('erro inesperado na ativacao pela revenda', e);
          done(e);
        });
    });
  });

  describe('listarAtivacoes()', function() {

    it('lista veiculos que estão ativados e não estao fiscalizados.',
      function(done) {
        Ativacoes
          ._listarAtivacoes()
          .then(function() {
            done();
          })
          .catch(function(e) {
            done(e);
          });
      });
  });

});
