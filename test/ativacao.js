'use strict';

const debug = require('debug')('areaazul:test:ativacao');
const should = require('chai').should();

const math = require('money-math');

const AreaAzul = require('../areaazul');
const Ativacao = AreaAzul.facade.Ativacao;

const Bookshelf = require('../database');
const TestHelpers = require('areaazul-test-helpers')(AreaAzul, Bookshelf);
const AtivacaoModel = Bookshelf.model('Ativacao');
const AtivacaoUsuarioModel = Bookshelf.model('AtivacaoUsuario');
const ContaModel = Bookshelf.model('Conta');
const ConfiguracaoModel = Bookshelf.model('Configuracao');

describe('fachada Ativacao', function() {

  const placaVeiculoNovo = 'TAT1540';
  var idUsuarioComum;
  var veiculoExistente;
  var idCidade;
  var idUsuarioRevendedor;
  var idAtivacao;
  var configuracao;

  before(function() {
    return TestHelpers
      .pegarVeiculo()
      .then(v => {
        veiculoExistente = v;
        return TestHelpers
          .apagarVeiculoPorPlaca(placaVeiculoNovo);
      })
      .then(() => ConfiguracaoModel._buscar())
      .then(c => {
        configuracao = c;
      })
      .then(() => TestHelpers.pegarUsuario())
      .then(usuario => {
        idUsuarioComum = usuario.id;
        return new ContaModel({ id: usuario.get('conta_id') })
          .fetch();
      })
      .then(contaUsuario => {
        if (math.cmp(
            contaUsuario.get('saldo'),
            configuracao.get('valor_ativacao_reais')) > 0) {
          return;
        }
        return TestHelpers.setSaldo(
          contaUsuario, configuracao.get('valor_ativacao_reais'));
      })
      .then(() => TestHelpers.pegarRevendedor())
      .then(revendedor =>
        new ContaModel({ id: revendedor.get('conta_id') })
          .fetch())
      .then(contaRevendedor => {
        if (math.cmp(
            contaRevendedor.get('saldo'),
            configuracao.get('valor_ativacao_reais')) > 0) {
          return;
        }
        return TestHelpers.setSaldo(
          contaRevendedor, configuracao.get('valor_ativacao_reais'));
      })
      .then(() => TestHelpers.pegarUsuarioRevendedor())
      .then(function(usuarioRevendedor) {
        idUsuarioRevendedor = usuarioRevendedor.id;
      })
      .then(() => TestHelpers.pegarCidade())
      .then(cidade => {
        idCidade = cidade.id;
      })
      .then(() =>
        // Apagar ativações pendentes, para não afetar testes com novas
        // ativações.
        AtivacaoUsuarioModel
          .query(function(qb) {
            qb
              .whereExists(function() {
                this.select('*').from('ativacao')
                  .whereRaw('ativacao.id=ativacao_usuario.ativacao_id'
                    + ' and ativacao.data_desativacao is null');
              });
          })
          .destroy())
      .then(() =>
        AtivacaoModel
          .query(function(qb) {
            qb
              .whereNull('data_desativacao')
              .andWhere({ veiculo_id: veiculoExistente.id });
          })
          .destroy())
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
        tempo: 60
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
        .then(function(desativacao) {
          should.exist(desativacao);
          desativacao.should.have.property('id', idAtivacao);
          desativacao.should.have.property('data_desativacao')
            .greaterThan(desativacao.data_ativacao);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado na desativacao', e);
          done(e);
        });
    });
  });

  describe('ativarPorRevenda()', function() {
    it('falha com ativacao revenda sem usuario revendedor', function(done) {
      Ativacao
        .ativarPorRevenda({
          cidade: idCidade,
          placa: veiculoExistente.get('placa'),
          marca: veiculoExistente.get('marca'),
          modelo: veiculoExistente.get('modelo'),
          cor: veiculoExistente.get('cor'),
          tipo_veiculo: veiculoExistente.get('tipo'),
          tempo: 60
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
        .ativarPorRevenda({
          usuario_revendedor_id: 'a',
          cidade: idCidade,
          placa: veiculoExistente.get('placa'),
          marca: veiculoExistente.get('marca'),
          modelo: veiculoExistente.get('modelo'),
          cor: veiculoExistente.get('cor'),
          tipo_veiculo: veiculoExistente.get('tipo'),
          tempo: 60
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
        .ativarPorRevenda({
          usuario_revendedor_id: 0,
          cidade: idCidade,
          placa: veiculoExistente.get('placa'),
          marca: veiculoExistente.get('marca'),
          modelo: veiculoExistente.get('modelo'),
          cor: veiculoExistente.get('cor'),
          tipo_veiculo: veiculoExistente.get('tipo'),
          tempo: 60
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
        .ativarPorRevenda({
          usuario_revendedor_id: idUsuarioRevendedor,
          placa: placaVeiculoNovo,
          marca: veiculoExistente.get('marca'),
          modelo: veiculoExistente.get('modelo'),
          cor: veiculoExistente.get('cor'),
          tipo_veiculo: veiculoExistente.get('tipo'),
          tempo: 60
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
        .ativarPorRevenda({
          usuario_revendedor_id: idUsuarioRevendedor,
          cidade: idCidade,
          placa: veiculoExistente.get('placa'),
          marca: veiculoExistente.get('marca'),
          modelo: veiculoExistente.get('modelo'),
          cor: veiculoExistente.get('cor'),
          tipo_veiculo: veiculoExistente.get('tipo'),
          tempo: 60
        })
        .then(function(ativacao) {
          return new AtivacaoModel({ id: ativacao.id })
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

});
