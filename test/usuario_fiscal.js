var should = require('should');
var moment = require('moment');
var Promise = require('bluebird');

var AreaAzul = require('../areaazul');
var Fiscalizacao = AreaAzul.models.fiscalizacao;
var UsuarioFiscal = AreaAzul.models.UsuarioFiscal;
var Pessoa = AreaAzul.models.pessoa.Pessoa;
var PessoaFisica = AreaAzul.models.pessoafisica.PessoaFisica;
var UsuariosFiscais = AreaAzul.collections.UsuariosFiscais;

describe('models.UsuarioFiscal', function () {
  var cpf_pre_existente = 'fiscal-teste-pre-existente';
  var cpf_nao_existente = 'fiscal-teste-nao-existente';
  var login_fiscal_pf_pre_existente = 'fiscal-pf-pre-existente';
  var login_fiscal_pf_nao_existente = 'fiscal-pf-nao-existente';
  var senha_fiscal_pf_pre_existente = 'senha-fiscal-pf-pre-existente';

  function delete_pessoa_fisica(cpf) {
    var pessoa_id = null;
    return PessoaFisica
      .forge({cpf: cpf})
      .fetch()
      .then(function (pf) {
        if (pf !== null) {
          pessoa_id = pf.get('pessoa_id');
          return UsuarioFiscal
            .forge({pessoa_id: pessoa_id})
            .destroy();
        }
      })
      .then(function () {
        if (pessoa_id !== null) {
          return PessoaFisica
            .forge({pessoa_id: pessoa_id})
            .destroy();
        }
      })
      .then(function () {
        if (pessoa_id !== null) {
          return Pessoa
            .forge({id_pessoa: pessoa_id})
            .destroy();
        }
      });
  }

  function delete_test_data() {
    return delete_pessoa_fisica(cpf_pre_existente)
      .then(function () {
        return delete_pessoa_fisica(cpf_nao_existente);
      });
  }

  before(function (done) {
    delete_test_data()
      .then(function () {
        PessoaFisica.cadastrar({
          nome: 'PF preexistente',
          email: 'preexistente@example.com',
          cpf: cpf_pre_existente,
        }, function () { // then
          done();
        }, function (e) { // fail
          done(e);
        });
      });
  });

  describe('cadastrar()', function () {

    it('cadastra fiscal com cpf novo', function (done) {
      UsuarioFiscal.cadastrar({
        login: login_fiscal_pf_nao_existente,
        nome: 'Fiscal Teste',
        email: 'fiscal-teste@example.com',
        cpf: cpf_nao_existente
      }, function (pessoa) {
        should.exist(pessoa);
        done();
      }, function (e) {
        done(e);
      });
    });

    it('cadastra fiscal com cpf existente', function (done) {
      UsuarioFiscal.cadastrar({
        login: login_fiscal_pf_pre_existente,
        senha: senha_fiscal_pf_pre_existente,
        nome: 'Fiscal Teste',
        email: 'fiscal-teste@example.com',
        cpf: cpf_pre_existente
      }, function (pessoa) {
        should.exist(pessoa);
        done();
      }, function (e) {
        done(e);
      });
    });

  });

  describe("valido()", function() {

    it('aceita credencial valida', function (done) {
      UsuarioFiscal.valido(
        login_fiscal_pf_pre_existente,
        senha_fiscal_pf_pre_existente)
        .then(function(usuario_fiscal) {
          should.exist(usuario_fiscal);
          done();
        })
        .catch(function (err) {
          done(err);
        });
    });

    it('recusa credencial invalida', function (done) {
      UsuarioFiscal.valido(
        login_fiscal_pf_pre_existente,
        senha_fiscal_pf_pre_existente + '0')
        .then(function(usuario_fiscal) {
          done('Nao deve aceitar senha errada');
        })
        .catch(function (err) {
          should.exist(err);
          should.exist(err.authentication_event);
          err.authentication_event.should.be.exactly(true);
          done();
        });
    });

    it('recusa login invalido', function (done) {
      UsuarioFiscal.valido(
        login_fiscal_pf_pre_existente + '0',
        senha_fiscal_pf_pre_existente)
        .then(function(usuario_fiscal) {
          done('Nao deve aceitar login errada');
        })
        .catch(function (err) {
          should.exist(err);
          should.exist(err.authentication_event);
          err.authentication_event.should.be.exactly(true);
          done();
        });
    });

  });

  after(function (done) {
    delete_test_data()
      .then(function () {
        done();
      })
      .catch(function (e) {
        done(e);
      });
  });
});
