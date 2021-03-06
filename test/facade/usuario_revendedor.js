'use strict';

const debug = require('debug')('areaazul:test:usuario_revenda');
const should = require('chai')
  .should();

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul._internals.Bookshelf;
const UsuarioRevendedor = AreaAzul.facade.UsuarioRevendedor;

const TestHelpers = require('../../test-helpers')(AreaAzul);

describe('models.UsuarioRevendedor', function() {
  const cpfNaoExistente = '58316661667';
  const senhaRevendaNaoExistente = 'senha-revenda';
  const loginRevendaNaoExistente = 'revenda-teste';
  let idUsuarioRevendedor = null;
  let idRevendedor = null;
  const termoDeServico = true;

  function apagarDadosDeTeste(trx) {
    return TestHelpers.apagarUsuarioRevendaPorLogin(loginRevendaNaoExistente, trx)
      .then(() => TestHelpers.apagarPessoaFisicaPorCPF(cpfNaoExistente, trx));
  }

  before(function() {
    return Bookshelf.transaction(trx =>
      apagarDadosDeTeste(trx)
        .then(function() {
          return TestHelpers.pegarRevendedor(trx);
        }))
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
        .then(function(usuRev) {
          should.exist(usuRev);
          usuRev.should.have.property('id');
          usuRev.should.have.property('login', loginRevendaNaoExistente);
          // Salvar id para testes de buscarPorId()
          idUsuarioRevendedor = usuRev.id;
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
        .then(function(usuRev) {
          should.exist(usuRev);
          usuRev.should.have.property('id');
          usuRev.should.have.property('login', loginRevendaNaoExistente);
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });

  describe('listarPorRevenda()', function() {

    it('lista usuários da revenda mantidos no banco de dados', function(done) {
      UsuarioRevendedor
        .listarPorRevenda(idRevendedor)
        .then(function(lista) {
          should.exist(lista);
          lista.should.be.instanceOf(Array);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('autentico()', function() {

    it('aceita credencial válida', function(done) {
      UsuarioRevendedor.autentico(
        loginRevendaNaoExistente,
        senhaRevendaNaoExistente)
        .then(function(usuRev) {
          should.exist(usuRev);
          usuRev.should.have.property('login', loginRevendaNaoExistente);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('recusa credencial inválida', function(done) {
      UsuarioRevendedor.autentico(
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
      UsuarioRevendedor.autentico(
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
          usuarioRevendedor.should.have.property(
            'id', idUsuarioRevendedor);
          usuarioRevendedor.should.have.property('ativo', false);
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });

});
