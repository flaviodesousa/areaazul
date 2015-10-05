'use strict';

var AreaAzul = require('../areaazul');
var should = require('chai').should();
var Revendedor = AreaAzul.models.Revendedor;
var TestHelpers = require('../helpers/test');

describe('model.revendedor', function() {

  var cpfPreExistente = 'fiscal-teste-fiscalizacao';
  var nomeTeste = 'teste - preexistente';
  var emailTeste = 'preexistente@example.com';
  var telefoneTeste = '000 0000-0000';
  var data_nascimentoTeste = new Date(1981, 11, 13);
  var cnpjPreExistente = '31604743000102';
  var razaoSocialTeste = 'razao-social-teste';
  var contatoTeste = 'contato-teste';
  var loginTeste = 'login-teste-usuario';
  var nomeFantasiaTeste = 'nome-fantasia-teste';
  var nomeEmpresa = 'nome-teste';
  var senhaTeste = 'senha-teste';
  var revendedorId = null;

  function apagarDadosDeTeste() {
    return TestHelpers.apagarRevendedorPessoPorIdentificador(cpfPreExistente, cnpjPreExistente);
  }

  before(function(done) {
    apagarDadosDeTeste()
      .then(function() {
        done();
      })
      .catch(function(e) {
        done(e);
      });
  });

  describe('validateRevendedorPessoaFisica()', function() {
    it('Validar revendedor pessoa fisica funciona', function(done) {
      Revendedor.validateRevendedorPessoaFisica({
        nome: null,
        email: 'teste@teste.com',
        celular: telefoneTeste,
        cpf: cpfPreExistente,
        data_nascimento: data_nascimentoTeste,
        autorizacao: 'autorizacao',
        login: loginTeste,
        senha: senhaTeste,
      })
     .then(function() {
        done();
      })
      .catch(function(e) {
        console.dir(e);
        done(e);
      });
    });
  });


  describe('cadastrar()', function() {
    it('cadastrar pessoa fisica funciona', function(done) {
      Revendedor.cadastrar({
        nome: null,
        email: null,
        celular: telefoneTeste,
        cpf: cpfPreExistente,
        data_nascimento: data_nascimentoTeste,
        autorizacao: 'autorizacao',
        login: loginTeste,
        senha: senhaTeste,
      })
      .then(function(revenda) {
        should.exist(revenda);
        revendedorId = revenda.id;
        done();
      })
      .catch(function(e) {
        console.dir(e);
        done(e);
      });
    });

    it('cadastrar pessoa juridica funciona', function(done) {
      Revendedor.cadastrar({
        cnpj: cnpjPreExistente,
        nome: nomeFantasiaTeste,
        nome_fantasia: nomeFantasiaTeste,
        razao_social: razaoSocialTeste,
        contato: contatoTeste,
        email: emailTeste,
        telefone: telefoneTeste,
        cpf: '63277083829',
        login: 'logindeteste',
        autorizacao: 'autorizacao teste',
        senha: senhaTeste,
      })
      .then(function(revenda) {
        should.exist(revenda);
        done();
      })
      .catch(function(e) {
        done(e);
      });
    });


  });

  describe('buscarRevendedor()', function() {
    it('retorna um revendedor', function(done) {
      Revendedor.buscarRevendedor({
        pessoa_id: revendedorId
      },
      function() {
        done();
      },
      function(err) {
        done(err);
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
