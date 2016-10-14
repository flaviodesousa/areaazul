'use strict';

const debug = require('debug')('areaazul:test:usuario_revenda');
const should = require('chai').should();

const AreaAzul = require('../areaazul');
const UsuarioRevendedor = AreaAzul.facade.UsuarioRevendedor;

describe('models.UsuarioRevendedor', function() {
  var cpfNaoExistente = '58316661667';
  var senhaRevendaNaoExistente = 'senha-revenda';
  var loginRevendaNaoExistente = 'revenda-teste';
  var idUsuarioRevendedor = null;
  var idRevendedor = null;
  var termoDeServico = true;

  function apagarDadosDeTeste(TestHelpers) {
    return TestHelpers
      .apagarUsuarioRevendaPorLogin(loginRevendaNaoExistente)
      .then(function() {
        return TestHelpers.apagarPessoaFisicaPorCPF(cpfNaoExistente);
      });
  }

  before(function() {
    const Bookshelf = require('../database');
    const TestHelpers = require('areaazul-test-helpers')(AreaAzul, Bookshelf);
    return apagarDadosDeTeste()
      .then(function() {
        return TestHelpers.pegarRevendedor();
      })
      .then(function(revendedor) {
        idRevendedor = revendedor.id;
      });
  });

  describe('cadastrar()', function() {

    it('cadastra usuário revendedor com cpf novo', function(done) {
      UsuarioRevendedor.inserir({
        login: loginRevendaNaoExistente,
        nome: 'Revenda Teste',
        autorizacao: 'funcionario',
        nova_senha: senhaRevendaNaoExistente,
        conf_senha: senhaRevendaNaoExistente,
        email: 'revenda@teste.com',
        cpf: cpfNaoExistente,
        revendedor_id: idRevendedor,
        termo_servico: termoDeServico
      })
        .then(function(usuarioRevendedor) {
          should.exist(usuarioRevendedor);
          // Salvar id para testes de buscarPorId()
          idUsuarioRevendedor = usuarioRevendedor.id;
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('alterar()', function() {

    it('altera usuário revendedor', function(done) {
      UsuarioRevendedor.alterar({
        login: loginRevendaNaoExistente,
        nome: 'Revenda Teste',
        autorizacao: 'funcionario',
        nova_senha: senhaRevendaNaoExistente,
        conf_senha: senhaRevendaNaoExistente,
        email: 'revenda_alterada@teste.com',
        cpf: cpfNaoExistente,
        revendedor_id: idRevendedor,
        termo_servico: termoDeServico
      })
        .then(function(pessoa) {
          should.exist(pessoa);
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });

  describe('listarUsuarioRevenda()', function() {

    it('lista usuários da revenda mantidos no banco de dados', function(done) {
      UsuarioRevendedor
        .listarUsuarioRevenda(idRevendedor)
        .then(function(lista) {
          should.exist(lista);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('autorizado()', function() {

    it('aceita credencial válida', function(done) {
      UsuarioRevendedor.autorizado(
        loginRevendaNaoExistente,
        senhaRevendaNaoExistente)
        .then(function(usuarioRevendedor) {
          should.exist(usuarioRevendedor);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('recusa credencial inválida', function(done) {
      UsuarioRevendedor.autorizado(
        loginRevendaNaoExistente,
        senhaRevendaNaoExistente + '0')
        .then(function() {
          done(new Error('Não deve aceitar senha errada'));
        })
        .catch(AreaAzul.AuthenticationError, function(err) {
          should.exist(err);
          err.should.be.an.instanceof(AreaAzul.AuthenticationError);
          err.should.have.property(
            'message',
            'Usuário revendedor: senha incorreta');
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('recusa login inválido', function(done) {
      UsuarioRevendedor.autorizado(
        loginRevendaNaoExistente + '0',
        senhaRevendaNaoExistente)
        .then(function() {
          done(new Error('Não deve aceitar login errado'));
        })
        .catch(AreaAzul.AuthenticationError, function(err) {
          should.exist(err);
          err.should.be.an.instanceof(AreaAzul.AuthenticationError);
          err.should.have.property(
            'message',
            'Usuário revendedor: login inválido');
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

  });

  describe('desativar()', function() {

    it('falha para usuário revendedor inexistente', function(done) {
      UsuarioRevendedor
        .desativar(0)
        .then(function() {
          done(new Error('Não deve aceitar id inválido'));
        })
        .catch(function(e) {
          should.exist(e);
          done();
        });
    });

    it('desativa usuário revendedor existente', function(done) {
      UsuarioRevendedor
        .desativar(idUsuarioRevendedor)
        .then(function(usuarioRevendedor) {
          should.exist(usuarioRevendedor);
          usuarioRevendedor.id.should.equal(idUsuarioRevendedor);
          usuarioRevendedor.get('ativo').should.equal(false);
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });

  after(function() {
    return apagarDadosDeTeste();
  });

});
