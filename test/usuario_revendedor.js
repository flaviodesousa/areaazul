'use strict';

var should = require('chai').should();
var TestHelpers = require('../helpers/test');
var AreaAzul = require('../areaazul');
var BusinessException = AreaAzul.BusinessException;
var UsuarioRevendedor = AreaAzul.models.UsuarioRevendedor;
var UsuarioRevendedorCollection = AreaAzul.collections.UsuarioRevendedor;
var PessoaFisica = AreaAzul.models.pessoafisica.PessoaFisica;


describe('models.UsuarioRevendedor', function() {
  var cpfPreExistente = '12341184758';
  var cpfNaoExistente = '58316661667';
//  var loginRevendaNaoExistente = 'revenda-nao-existente';
  var senhaRevendaExistente = 'senha-adm-pre-existente';
  var loginRevendaExistente = 'revenda-teste';
  var idUsuarioRevendedor = null;


  var revendedor_id = null;

  function apagarDadosDeTeste() {
    return TestHelpers.apagarUsuarioRevenda(idUsuarioRevendedor);
  }

  describe('cadastrar()', function() {

    it('cadastra usuario revendedor com cpf novo', function(done) {
        UsuarioRevendedor.cadastrar({
          login: loginRevendaExistente,
          nome: 'Revenda Teste',
          autorizacao: 'funcionario',
          senha: senhaRevendaExistente,
          email: 'revenda@teste.com',
          cpf: cpfNaoExistente,
        })
        .then(function(pessoa) {
          should.exist(pessoa);
          revendedor_id = pessoa.get('revendedor_id');
          // Salvar id para testes de buscarPorId()
          idUsuarioRevendedor = pessoa.id;
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });


  describe('listarUsuarioRevenda()', function() {

    it('lista usuario da revenda mantidos no banco de dados', function(done) {
        UsuarioRevendedorCollection.listarUsuarioRevenda(revendedor_id,
           function() {
              done();
            },
            function(e) {
              done();
            });
    });
  });

  describe('autorizado()', function() {

    it('aceita credencial valida', function(done) {
      UsuarioRevendedor.autorizado(
        loginRevendaExistente,
        senhaRevendaExistente)
        .then(function(usuarioRevendedor) {
          should.exist(usuarioRevendedor);
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });

    it('recusa credencial invalida', function(done) {
      UsuarioRevendedor.autorizado(
        loginRevendaExistente,
        senhaRevendaExistente + '0')
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

    it('recusa login invalido', function(done) {

      UsuarioRevendedor.autorizado(
        loginRevendaExistente + '0',
        senhaRevendaExistente)
        .then(function() {
          done('Nao deve aceitar login errado');
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
