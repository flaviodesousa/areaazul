'use strict';

const debug = require('debug')('areaazul:test:revendedor');
const should = require('chai')
  .should();

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul._internals.Bookshelf;
const TestHelpers = require('../../test-helpers')(AreaAzul);
const Revendedor = AreaAzul.facade.Revendedor;
const UsuarioRevendedor = AreaAzul.facade.UsuarioRevendedor;

describe('facade Revendedor', function() {
  const cpfRevendedorPF = '96818717748';
  const cnpjRevendedorPJ = '31604743000102';
  const loginRevendedorPF = 'teste-revendedor-pf';
  const loginUsuarioRevendedorPJ = 'teste-revendedor-pj';
  const cpfUsuarioRevendedorPJ = '54800416493';
  let idRevendedorPessoaFisica;
  let idRevendedorPessoaJuridica;

  function apagarRevendedoresDeTeste() {
    return Bookshelf.transaction(trx =>
      TestHelpers
        .apagarRevendedorPorCPF(cpfRevendedorPF, trx)
        .then(function() {
          return TestHelpers.apagarRevendedorPorCNPJ(cnpjRevendedorPJ, trx);
        }))
      .catch(function(e) {
        debug('erro inesperado', e);
        throw e;
      });
  }

  before(function() {
    return apagarRevendedoresDeTeste();
  });

  describe('cadastrar()', function() {
    it('cadastrar pessoa fisica funciona', function(done) {
      Revendedor.cadastrar({
        nome: 'Nome PF Teste Revendedor',
        email: 'pf-teste-revendedor@areaazul.org',
        telefone: '000 0000-0000',
        cpf: cpfRevendedorPF,
        data_nascimento: '31/10/1967',
        autorizacao: 'autorizacao',
        login: loginRevendedorPF,
        nova_senha: 'senha-teste',
        conf_senha: 'senha-teste',
        termo_servico: 'Sim'
      })
        .then(function(revenda) {
          should.exist(revenda);
          revenda.should.have.property('id');
          idRevendedorPessoaFisica = revenda.id;
          return UsuarioRevendedor
            .buscarPorLogin(loginRevendedorPF);
        })
        .then(function(urpf) {
          should.exist(urpf);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('cadastrar pessoa juridica funciona', function(done) {
      Revendedor.cadastrar({
        cnpj: cnpjRevendedorPJ,
        nome: 'Nome PJ Teste Revendedor',
        nome_fantasia: 'nome-fantasia-teste',
        razao_social: 'razao-social-teste',
        contato: 'contato-teste',
        email: 'teste-revendedor@areaazul.org',
        telefone: '000 0000-0000',
        cpf: cpfUsuarioRevendedorPJ,
        login: loginUsuarioRevendedorPJ,
        autorizacao: 'autorizacao teste',
        nova_senha: 'senha-teste',
        conf_senha: 'senha-teste',
        termo_servico: 'Sim'
      })
        .then(function(revenda) {
          should.exist(revenda);
          revenda.should.have.property('id');
          idRevendedorPessoaJuridica = revenda.id;
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('buscarPorId()', function() {
    it('Encontra Revenda Pessoa Física pelo ID', function(done) {
      Revendedor
        .buscarPorId(idRevendedorPessoaFisica)
        .then(function(revenda) {
          should.exist(revenda);
          revenda.should.have.property('conta');
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('Encontra Revenda Pessoa Jurídica pelo ID', function(done) {
      Revendedor
        .buscarPorId(idRevendedorPessoaJuridica)
        .then(function(revenda) {
          should.exist(revenda);
          revenda.should.have.property('conta');
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('buscarPorIdUsuarioRevendedor()', function() {
    let idUsuarioRevenda = null;

    before(function() {
      return UsuarioRevendedor
        .buscarPorLogin(loginUsuarioRevendedorPJ)
        .then(function(usuarioRevenda) {
          should.exist(usuarioRevenda);
          idUsuarioRevenda = usuarioRevenda.pessoa_fisica_id;
        });
    });

    it('retorna um revendedor', function(done) {
      Revendedor
        .buscarPorIdUsuarioRevendedor(idUsuarioRevenda)
        .then(function(revenda) {
          should.exist(revenda);
          revenda.should.have.property('conta');
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('comprarCreditos()', function() {
    it('compra créditos PF', function(done) {
      Revendedor
        .comprarCreditos({
          cpf: cpfRevendedorPF,
          creditos: '937.00'
        })
        .then(movimentacao => {
          should.exist(movimentacao);
          movimentacao.should.have.property('conta');
          movimentacao.conta.should.have.property('saldo', '937.00');
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('compra créditos PJ', function(done) {
      Revendedor
        .comprarCreditos({
          cnpj: cnpjRevendedorPJ,
          creditos: '937.00'
        })
        .then(movimentacao => {
          should.exist(movimentacao);
          movimentacao.should.have.property('conta');
          movimentacao.conta.should.have.property('saldo', '937.00');
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('venderCreditos()', function() {
    let idUsuario = null;

    before(function() {
      return Bookshelf.transaction(trx =>
        TestHelpers.pegarUsuario(trx)
      )
        .then(usuario => {
          idUsuario = usuario.id;
        });
    });

    it('vende créditos', function(done) {
      Revendedor
        .venderCreditos({
          idRevendedor: idRevendedorPessoaFisica,
          idUsuario: idUsuario,
          creditos: '50'
        })
        .then(movimentacao => {
          should.exist(movimentacao);
          movimentacao.should.have.property('conta');
          movimentacao.conta.should.have.property('saldo', '887.00');
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });
});
