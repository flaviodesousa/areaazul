'use strict';

const debug = require('debug')('areaazul:test:revendedor');
const should = require('chai').should();

const AreaAzul = require('../areaazul');
const Bookshelf = AreaAzul.db;

const Revendedor = Bookshelf.model('Revendedor');

const TestHelpers = require('../helpers/test');

describe('model.revendedor', function() {

  var cpfRevendaPF = '96818717748';
  var cpfUsuarioRevendaPJ = '54800416493';
  var emailTeste = 'teste-revendedor@areaazul.org';
  var telefoneTeste = '000 0000-0000';
  var dataNascimentoTeste = '13-11-1981';
  var cnpjRevendaPJ = '31604743000102';
  var razaoSocialTeste = 'razao-social-teste';
  var contatoTeste = 'contato-teste';
  var loginTestePF = 'teste-revendedor-pf';
  var loginTestePJ = 'teste-revendedor-pj';
  var nomeFantasiaTeste = 'nome-fantasia-teste';
  var senhaTeste = 'senha-teste';
  var termoServico = true;

  function apagarRevendedoresDeTeste() {
    return TestHelpers
      .apagarRevendedorPorCPF(cpfRevendaPF)
      .then(function() {
        debug('should have deleted cpf ' + cpfRevendaPF);
        return TestHelpers.apagarRevendedorPorCNPJ(cnpjRevendaPJ);
      })
      .catch(function(e) {
        debug('erro inesperado', e);
        throw e;
      });
  }

  before(function() {
    debug('before');
    return apagarRevendedoresDeTeste();
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
    var idUsuarioRevenda = null;

    before(function() {
      const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');
      return UsuarioRevendedor
        .procurarLogin(loginTestePJ)
        .then(function(usuarioRevenda) {
          idUsuarioRevenda = usuarioRevenda.get('pessoa_fisica_id');
        })
    });

    it('retorna um revendedor', function(done) {
      Revendedor
        .buscarRevendedor({ pessoa_fisica_id: idUsuarioRevenda })
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

  after(function() {
    debug('after');
    return apagarRevendedoresDeTeste();
  });

});
