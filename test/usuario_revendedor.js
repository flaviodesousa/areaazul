'use strict';

var should = require('chai').should();
var TestHelpers = require('../helpers/test');
var AreaAzul = require('../areaazul');
var BusinessException = AreaAzul.BusinessException;
var UsuarioRevendedor = AreaAzul.models.UsuarioRevendedor;
var PessoaFisica = AreaAzul.models.pessoafisica.PessoaFisica;

describe('models.UsuarioRevendedor', function() {
  var cpfPreExistente = 'revenda-teste-pre-existente';
  var cpfNaoExistente = 'revenda-teste-nao-existente';
  var loginRevendaPreExistente = 'revenda-pre-existente';
  var loginRevendaNaoExistente = 'revenda-nao-existente';
  var senhaRevendaPreExistente = 'senha-adm-pre-existente';
  var idUsuarioRevendedor = null;

  function apagarDadosDeTeste() {
    return TestHelpers.apagarUsuarioRevenda(idUsuarioRevendedor);
  }

  describe('cadastrar()', function() {

    it('cadastra usuario revendedor com cpf novo', function(done) {
      UsuarioRevendedor.cadastrar({
        login: loginRevendaNaoExistente,
        nome: 'Revenda Teste',
        autorizacao: 'funcionario',
        senha: senhaRevendaPreExistente,
        email: 'revenda@teste.com',
        cpf: cpfNaoExistente,
      })
        .then(function(pessoa) {
          should.exist(pessoa);
          // Salvar id para testes de buscarPorId()
          idUsuarioRevendedor = pessoa.id;
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });

  describe('autorizado()', function() {

    it('aceita credencial valida', function(done) {
      UsuarioRevendedor.autorizado(
        loginRevendaNaoExistente,
        senhaRevendaPreExistente)
        .then(function(usuarioRevendedor) {
          should.exist(usuarioRevendedor);
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });

    it.skip('recusa credencial invalida', function(done) {
      UsuarioRevendedor.autorizado(
        loginRevendaNaoExistente,
        senhaRevendaPreExistente + '0')
        .then(function() {
          done('Nao deve aceitar senha errada');
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

    it.skip('recusa login invalido', function(done) {
      UsuarioRevendedor.autorizado(
        loginRevendaNaoExistente + '0',
        senhaRevendaPreExistente)
        .then(function() {
          done('Nao deve aceitar login errado');
        })
        .catch(function(err) {
          should.exist(err);
          err.should.be.an.instanceof(BusinessException);
          err.should.have.property(
            'message',
            'UsuarioAdministrativo: login invalido');
          done();
        });
    });

  });

  after(function(done) {
    apagarDadosDeTeste()
      .then(function() {
        done();
      })
      .catch(function(e) {
        done(e);
      });
  });
});
