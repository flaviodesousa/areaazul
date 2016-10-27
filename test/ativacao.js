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
  const tempoPadrao = '120';
  const tempoExcessivo = '960';
  var precoDaAtivacao;
  var idUsuarioComum;
  var veiculoExistente;
  var idCidade;
  var idUsuarioRevendedor;
  var idAtivacao;
  var contaRevendedor;
  var contaUsuario;
  const saldoInicial = '10.00';
  var saldoFinalEsperado;

  before(function() {
    return TestHelpers
      .pegarVeiculo()
      .then(v => {
        veiculoExistente = v;
        return TestHelpers
          .apagarVeiculoPorPlaca(placaVeiculoNovo);
      })
      .then(() => ConfiguracaoModel._buscar())
      .then(configuracao => {
        precoDaAtivacao =
          math.div(
            math.mul(
              configuracao.get('valor_ativacao_reais'),
              math.floatToAmount(tempoPadrao)),
            '60.00');
        saldoFinalEsperado =
          math.subtract(saldoInicial, precoDaAtivacao);
      })
      .then(() => TestHelpers.pegarUsuario())
      .then(usuario => {
        idUsuarioComum = usuario.id;
        return new ContaModel({ id: usuario.get('conta_id') })
          .fetch({ require: true });
      })
      .then(cu => {
        contaUsuario = cu;
        TestHelpers.setSaldo(contaUsuario, saldoInicial);
      })
      .then(() => TestHelpers.pegarRevendedor())
      .then(revendedor =>
        new ContaModel({ id: revendedor.get('conta_id') })
          .fetch({ require: true }))
      .then(cr => {
        contaRevendedor = cr;
        TestHelpers.setSaldo(contaRevendedor, saldoInicial);
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
        debug('erro inesperado', e);
        throw e;
      });
  });

  describe('Ativar()', function() {
    it('falha ativação sem usuário', function(done) {
      var ativacao = {
        veiculo_id: veiculoExistente.id,
        tempo: tempoPadrao
      };

      Ativacao
        .ativar(ativacao)
        .then(() => {
          done('Não deveria ter ativado sem usuário');
        })
        .catch(AreaAzul.BusinessException, () => {
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('falha ativação sem veículo', function(done) {
      var ativacao = {
        usuario_id: idUsuarioComum,
        tempo: tempoPadrao
      };

      Ativacao
        .ativar(ativacao)
        .then(() => {
          done('Não deveria ter ativado sem veículo');
        })
        .catch(AreaAzul.BusinessException, () => {
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('falha ativação sem tempo', function(done) {
      var ativacao = {
        usuario_id: idUsuarioComum,
        veiculo_id: veiculoExistente.id
      };

      Ativacao
        .ativar(ativacao)
        .then(() => {
          done(new Error('Não deveria ter ativado sem tempo especificado'));
        })
        .catch(AreaAzul.BusinessException, () => {
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('falha ativação sem saldo', function(done) {
      var ativacao = {
        usuario_id: idUsuarioComum,
        veiculo_id: veiculoExistente.id,
        tempo: tempoExcessivo
      };

      Ativacao
        .ativar(ativacao)
        .then(() => {
          done(new Error('Não deveria ter ativado sem saldo'));
        })
        .catch(AreaAzul.BusinessException, () => {
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('grava ativação', function(done) {
      var ativacao = {
        usuario_id: idUsuarioComum,
        veiculo_id: veiculoExistente.id,
        tempo: tempoPadrao
      };

      Ativacao
        .ativar(ativacao)
        .then(function(at) {
          should.exist(at);
          should.exist(at.id);
          idAtivacao = at.id;
          return new ContaModel({ id: contaUsuario.id })
            .fetch({ require: true });
        })
        .then(contaUsuario => {
          contaUsuario.get('saldo').should.equal(saldoFinalEsperado);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('desativar()', function() {

    it('falha para ativação inexistente', function(done) {
      Ativacao
        .desativar({
          ativacao_id: 0,
          usuario_id: idUsuarioComum
        })
        .then(function() {
          done(new Error(
            'Não deveria ter desativado uma ativação inexistente'));
        })
        .catch(AreaAzul.BusinessException, () => {
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('falha se usuário diferente do ativador', function(done) {
      Ativacao
        .desativar({
          ativacao_id: idAtivacao,
          usuario_id: 0
        })
        .then(function() {
          done(new Error('Não deveria ter desativado com usuário diferente'));
        })
        .catch(AreaAzul.BusinessException, () => {
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('desativa ativação existente', function(done) {
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
    it('falha com ativação revenda sem usuário revendedor', function(done) {
      Ativacao
        .ativarPorRevenda({
          cidade_id: idCidade,
          placa: veiculoExistente.get('placa'),
          marca: veiculoExistente.get('marca'),
          modelo: veiculoExistente.get('modelo'),
          cor: veiculoExistente.get('cor'),
          tipo_veiculo: veiculoExistente.get('tipo'),
          tempo: tempoPadrao
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

    it('falha com ativação revenda com usuário inválido', function(done) {
      Ativacao
        .ativarPorRevenda({
          usuario_revendedor_id: 'a',
          cidade_id: idCidade,
          placa: veiculoExistente.get('placa'),
          marca: veiculoExistente.get('marca'),
          modelo: veiculoExistente.get('modelo'),
          cor: veiculoExistente.get('cor'),
          tipo_veiculo: veiculoExistente.get('tipo'),
          tempo: tempoPadrao
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
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('falha com ativação revenda com usuário inexistente', function(done) {
      Ativacao
        .ativarPorRevenda({
          usuario_revendedor_id: 0,
          cidade_id: idCidade,
          placa: veiculoExistente.get('placa'),
          marca: veiculoExistente.get('marca'),
          modelo: veiculoExistente.get('modelo'),
          cor: veiculoExistente.get('cor'),
          tipo_veiculo: veiculoExistente.get('tipo'),
          tempo: tempoPadrao
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
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('falha com ativação revenda sem cidade do veículo', function(done) {
      Ativacao
        .ativarPorRevenda({
          usuario_revendedor_id: idUsuarioRevendedor,
          placa: placaVeiculoNovo,
          marca: veiculoExistente.get('marca'),
          modelo: veiculoExistente.get('modelo'),
          cor: veiculoExistente.get('cor'),
          tipo_veiculo: veiculoExistente.get('tipo'),
          tempo: tempoPadrao
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
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('grava ativação revenda', function(done) {
      Ativacao
        .ativarPorRevenda({
          usuario_revendedor_id: idUsuarioRevendedor,
          cidade_id: idCidade,
          placa: placaVeiculoNovo,
          marca: veiculoExistente.get('marca'),
          modelo: veiculoExistente.get('modelo'),
          cor: veiculoExistente.get('cor'),
          tipo_veiculo: veiculoExistente.get('tipo'),
          tempo: tempoPadrao
        })
        .then(function(ativacao) {
          should.exist(ativacao);
          ativacao.should.have.property('id');
          return new ContaModel({ id: contaRevendedor.id })
            .fetch({ require: true });
        })
        .then(contaRevendedor => {
          contaRevendedor.get('saldo').should.equal(saldoFinalEsperado);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

});
