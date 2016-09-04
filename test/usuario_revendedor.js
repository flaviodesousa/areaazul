'use strict';

const debug = require('debug')('areaazul:test:usuario_revenda');
var should = require('chai').should();
const AreaAzul = require('../areaazul');
const Bookshelf = AreaAzul.db;
var BusinessException = AreaAzul.BusinessException;

const Revendedor = Bookshelf.model('Revendedor');
var UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');
var UsuariosRevendedores = Bookshelf.collection('UsuariosRevendedores');
var PessoaFisica = Bookshelf.model('PessoaFisica');

var TestHelpers = require('../helpers/test');

describe('models.UsuarioRevendedor', function() {
  var cpfNaoExistente = '58316661667';
  var senhaRevendaNaoExistente = 'senha-revenda';
  var loginRevendaNaoExistente = 'revenda-teste';
  var idUsuarioRevendedor = null;
  var idRevendedor = null;
  var termoDeServico = true;

  function apagarDadosDeTeste() {
    return TestHelpers
      .apagarUsuarioRevendaPorLogin(loginRevendaNaoExistente)
      .then(function() {
        return TestHelpers.apagarPessoaFisicaPorCPF(cpfNaoExistente);
      });
  }

  before(function() {
    return apagarDadosDeTeste()
      .then(function() {
        return TestHelpers.pegarRevendedor();
      })
      .then(function(revendedor) {
        idRevendedor = revendedor.id;
      });
  });

  describe('cadastrar()', function() {

    it('cadastra usuario revendedor com cpf novo', function(done) {
      UsuarioRevendedor.inserir({
        login: loginRevendaNaoExistente,
        nome: 'Revenda Teste',
        autorizacao: 'funcionario',
        nova_senha: senhaRevendaNaoExistente,
        conf_senha: senhaRevendaNaoExistente,
        email: 'revenda@teste.com',
        cpf: cpfNaoExistente,
        revendedor_id: idRevendedor,
        termo_servico: termoDeServico,
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

    it('altera usuario revendedor', function(done) {
      UsuarioRevendedor.alterar({
        login: loginRevendaNaoExistente,
        nome: 'Revenda Teste',
        autorizacao: 'funcionario',
        nova_senha: senhaRevendaNaoExistente,
        conf_senha: senhaRevendaNaoExistente,
        email: 'revenda_alterada@teste.com',
        cpf: cpfNaoExistente,
        revendedor_id: idRevendedor,
        termo_servico: termoDeServico,
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

    it('lista usuario da revenda mantidos no banco de dados', function(done) {
      UsuariosRevendedores
        .listarUsuarioRevenda(idRevendedor)
        .then(function() {
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('autorizado()', function() {

    it('aceita credencial valida', function(done) {
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

    it('recusa credencial invalida', function(done) {
      UsuarioRevendedor.autorizado(
        loginRevendaNaoExistente,
        senhaRevendaNaoExistente + '0')
        .then(function() {
          done(new Error('Nao deve aceitar senha errada'));
        })
        .catch(function(err) {
          should.exist(err);
          err.should.be.an.instanceof(BusinessException);
          err.should.have.property(
            'message',
            'UsuarioRevendedor: senha incorreta');
          done();
        });
    });

    it('recusa login invalido', function(done) {

      UsuarioRevendedor.autorizado(
        loginRevendaNaoExistente + '0',
        senhaRevendaNaoExistente)
        .then(function() {
          done(new Error('Nao deve aceitar login errado'));
        })
        .catch(function(err) {
          should.exist(err);
          err.should.be.an.instanceof(BusinessException);
          err.should.have.property(
            'message',
            'UsuarioRevendedor: login invalido');
          done();
        });
    });

  });

  describe('desativar()', function() {

    it('falha para usuario revendedor inexistente', function(done) {
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

    it('desativa usuario revendedor existente', function(done) {
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
