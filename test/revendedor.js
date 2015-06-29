'use strict';

var AreaAzul = require('../areaazul');
var should = require('chai').should();
var Revendedor = AreaAzul.models.Revendedor;
var TestHelpers = require('../helpers/test');

describe('model.revendedor', function() {

  var cpfPreExistente = 'revenda-teste-pre-existente';
  var nomeTeste = 'teste - preexistente';
  var emailTeste = 'preexistente@example.com';
  var telefoneTeste = '0';
  var data_nascimentoTeste = new Date(1981, 11, 13);
  var sexoTeste = 'feminino';
  var cnpjPreExistente = 'revenda-teste-pessoa_juridica';
  var ramoAtividadeTeste = 'ramo-atividade-teste';
  var razaoSocialTeste = 'razao-social-teste';
  var inscricaoEstadualTeste = 'inscricao-estadual-teste';
  var contatoTeste = 'contato-teste';
  var ramoAtividadeTeste = 'ramo-teste';
  var loginTeste = 'login-teste-usuario';
  var nomeFantasiaTeste = 'nome-fantasia-teste';
  var nomeEmpresa = 'nome-teste';
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
        console.log("e -> " + e);
        done(e);
      });
  });



  describe('cadastrar()', function() {

    it('cadastrar pessoa fisica funciona', function(done) {
      Revendedor.cadastrar({
        nome: nomeTeste,
        email: emailTeste,
        telefone: telefoneTeste,
        cpf: cpfPreExistente,
        data_nascimento: data_nascimentoTeste,
        autorizacao: 'autorizacao',
        sexo: sexoTeste,
        login: loginTeste,
      })
      .then(function(revenda) {
        should.exist(revenda);
        revendedorId = revenda.id;
        done();
      })
      .catch(function(e) {
        done(e);
      });
    });


    it('cadastrar pessoa juridica funciona', function(done) {
      Revendedor.cadastrar({
        cnpj: cnpjPreExistente,
        nome: nomeFantasiaTeste,
        nome_fantasia: nomeFantasiaTeste,
        razao_social: razaoSocialTeste,
        inscricao_estadual: inscricaoEstadualTeste,
        contato: contatoTeste,
        ramo_atividade: ramoAtividadeTeste,
        email: emailTeste,
        telefone: telefoneTeste,
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
      function(model) {
        should.exist(model);
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
        console.log("e -> " + e);
        done(e);
      });
  });

});
