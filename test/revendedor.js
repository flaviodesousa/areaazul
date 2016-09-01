'use strict';

var debug = require('debug')('areaazul:test:revendedor');
var should = require('chai').should();

const AreaAzul = require('../areaazul');
const Bookshelf = AreaAzul.db;

var Revendedor = Bookshelf.model('Revendedor');

var TestHelpers = require('../helpers/test');

describe('model.revendedor', function() {

  var cpfRevendaPF = '96818717748';
  var cpfUsuarioRevendaPJ = '54800416493';
  var emailTeste = 'teste-revendedor@areaazul.org';
  var telefoneTeste = '000 0000-0000';
  var dataNascimentoTeste = new Date(1981, 11, 13);
  var cnpjRevendaPJ = '31604743000102';
  var razaoSocialTeste = 'razao-social-teste';
  var contatoTeste = 'contato-teste';
  var loginTestePF = 'teste-revendedor-pf';
  var loginTestePJ = 'teste-revendedor-pj';
  var nomeFantasiaTeste = 'nome-fantasia-teste';
  var senhaTeste = 'senha-teste';
  var revendedorId = null;
  var termoServico = true;

  before(function() {
    debug('before');
    return TestHelpers
      .apagarRevendedorPorCPF(cpfRevendaPF)
      .then(function() {
        debug('should have deleted cpf ' + cpfRevendaPF);
        return TestHelpers.apagarRevendedorPorCNPJ(cnpjRevendaPJ);
      });
  });

  describe('validarRevenda()', function() {
    it('Validar revendedor pessoa fisica funciona', function(done) {
      Revendedor.validarRevenda({
          nome: 'revenda-teste',
          email: 'teste@teste.com',
          celular: telefoneTeste,
          cpf: cpfRevendaPF,
          data_nascimento: dataNascimentoTeste,
          autorizacao: 'autorizacao',
          login: loginTestePF,
          senha: senhaTeste,
          termo_servico: termoServico
        })
        .then(function() {
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('Validar revendedor pessoa juridica funciona', function(done) {
      Revendedor.validarRevenda({
          cnpj: cnpjRevendaPJ,
          nome: nomeFantasiaTeste,
          nome_fantasia: nomeFantasiaTeste,
          razao_social: razaoSocialTeste,
          contato: contatoTeste,
          email: emailTeste,
          telefone: telefoneTeste,
          cpf: cpfUsuarioRevendaPJ,
          login: loginTestePJ,
          autorizacao: 'autorizacao teste',
          senha: senhaTeste,
          termo_servico: termoServico
        })
        .then(function() {
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });


  describe('cadastrar()', function() {
    it('cadastrar pessoa fisica funciona', function(done) {
      Revendedor.cadastrar({
          nome: 'nome',
          email: 'email@teste.com',
          telefone: telefoneTeste,
          cpf: cpfRevendaPF,
          data_nascimento: dataNascimentoTeste,
          autorizacao: 'autorizacao',
          login: loginTestePF,
          senha: senhaTeste,
          termo_servico: termoServico
        })
        .then(function(revenda) {
          should.exist(revenda);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('cadastrar pessoa juridica funciona', function(done) {
      Revendedor.cadastrar({
          cnpj: cnpjRevendaPJ,
          nome: nomeFantasiaTeste,
          nome_fantasia: nomeFantasiaTeste,
          razao_social: razaoSocialTeste,
          contato: contatoTeste,
          email: emailTeste,
          telefone: telefoneTeste,
          cpf: cpfUsuarioRevendaPJ,
          login: loginTestePJ,
          autorizacao: 'autorizacao teste',
          senha: senhaTeste,
          termo_servico: termoServico
        })
        .then(function(revenda) {
          should.exist(revenda);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('buscarRevendedor()', function() {
    it('retorna um revendedor', function(done) {
      Revendedor.buscarRevendedor({ pessoa_fisica_id: revendedorId },
        function() {
          done();
        },
        function(e) {
          debug('Não encontrou Revendedor com id=' + revendedorId, e);
          done(e);
        });
    });
  });

});
