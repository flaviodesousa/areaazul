'use strict';

const debug = require('debug')('areaazul:test:usuario');
const should = require('chai').should();
const Promise = require('bluebird');
const moment = require('moment');

const AreaAzul = require('../../areaazul');
const Usuario = AreaAzul.facade.Usuario;
const Ativacao = AreaAzul.facade.Ativacao;

const TestHelpers = require('../../test-helpers')(AreaAzul);

describe('facade Usuario', function() {
  const camposUsuarioDeTeste = {
    login: 'login-teste-unitario-usuario',
    nova_senha: 'senha-teste-unitario-usuario',
    conf_senha: 'senha-teste-unitario-usuario',
    nome: 'Teste Unitário Usuário',
    email: 'teste-unitario-usuario@areaazul.org',
    telefone: '00 0000 0000',
    cpf: '32807868193',
    data_nascimento: '10/04/1980',
    sexo: 'feminino'
  };
  let usuarioDeTeste = null;

  function apagarDadosDeTeste() {
    return TestHelpers.apagarUsuarioPorLogin(camposUsuarioDeTeste.login);
  }

  before(function(done) {
    apagarDadosDeTeste()
      .then(function() {
        done();
      })
      .catch(function(e) {
        debug('erro inesperado em before()', e);
        done(e);
      });
  });

  after(function(done) {
    apagarDadosDeTeste()
      .then(function() {
        done();
      })
      .catch(function(e) {
        debug('erro inesperado em after()', e);
        done(e);
      });
  });

  describe('cadastrar()', function() {
    it('grava usuario', function(done) {
      Usuario
        .inserir(camposUsuarioDeTeste)
        .then(function(usuario) {
          usuarioDeTeste = usuario;
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('autentico()', function() {
    it('aceita credenciais validas', function(done) {
      Usuario.autentico(
        camposUsuarioDeTeste.login,
        camposUsuarioDeTeste.nova_senha)
        .then(function(usuario) {
          should.exist(usuario);
          usuario.get('login').should.equal(camposUsuarioDeTeste.login);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('recusa credencial invalida', function(done) {
      Usuario.autentico(
        camposUsuarioDeTeste.login,
        camposUsuarioDeTeste.nova_senha + '0')
        .then(function() {
          done(new Error('Nao deve aceitar senha errada'));
        })
        .catch(AreaAzul.AuthenticationError, function(err) {
          should.exist(err);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('recusa login invalido', function(done) {
      Usuario.autentico(
        camposUsuarioDeTeste.login + '0',
        camposUsuarioDeTeste.nova_senha)
        .then(function() {
          done(new Error('Nao deve aceitar login errado'));
        })
        .catch(AreaAzul.AuthenticationError, function(err) {
          should.exist(err);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('alterarSenha()', function() {
    it('altera senha dos usuarios', function(done) {
      if (!usuarioDeTeste) {
        done(new Error('Sem usuário corrente'));
      }
      const usuarioTrocaSenha = {
        id: usuarioDeTeste.id,
        login: camposUsuarioDeTeste.login,
        senha: camposUsuarioDeTeste.nova_senha,
        nova_senha: camposUsuarioDeTeste.nova_senha + '0',
        conf_senha: camposUsuarioDeTeste.nova_senha + '0'
      };
      Usuario.alterarSenha(usuarioTrocaSenha)
        .then(function() {
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });

  describe('listaAtivacoes()', function() {
    let usuario;
    let ativacoes = [];
    before(function(done) {
      let veiculos = [];

      this.timeout(5000);
      TestHelpers.pegarUsuario()
        .then(u => {
          usuario = u;
        })
        .then(() => {
          let p = [];
          for (let i = 0; i < 3; ++i) {
            p.push(
              TestHelpers.pegarVeiculo(i)
                .then(v => veiculos[i] = v));
          }
          return Promise.all(p);
        })
        .then(() =>
          TestHelpers.setSaldo(usuario.related('conta'), '88.88'))
        .then(() => {
          let variasAtivacoes = [];
          for (let i = 0; i < 10; ++i) {
            variasAtivacoes.push(new Promise((resolve, reject) =>
              setTimeout(
                () => Ativacao
                  .ativar({
                    usuario_id: usuario.id,
                    veiculo_id: veiculos[i % 3].id,
                    tempo: 60
                  })
                  .then(a => ativacoes[ i ] = a)
                  .then(() => Ativacao.desativar({
                    ativacao_id: ativacoes[ i ].id,
                    usuario_id: usuario.id
                  }))
                  .then(() => resolve(ativacoes[ i ]))
                  .catch((e) => reject(e)),
                50 * i)));
          }
          return Promise.all(variasAtivacoes);
        })
        .then(() => done())
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('obtém lista das últimas ativações', function(done) {
      Usuario
        .listaAtivacoes(usuario.id)
        .then(lista => {
          should.exist(lista);
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('obtém lista com apenas as 5 últimas ativações', function(done) {
      Usuario
        .listaAtivacoes(usuario.id, moment().utc(), 5)
        .then(lista => {
          should.exist(lista);
          lista.length.should.equal(5);
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('obtém lista com apenas as 2 ativações anteriores à 5a', function(done) {
      Usuario
        .listaAtivacoes(usuario.id, ativacoes[4].data_ativacao, 2)
        .then(lista => {
          should.exist(lista);
          lista.length.should.equal(2);
          lista[0].data_ativacao.should.be.below(ativacoes[4].data_ativacao);
          lista[1].data_ativacao.should.be.below(ativacoes[4].data_ativacao);
          lista[1].data_ativacao.should.be.below(lista[0].data_ativacao);
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('listaVeiculos()', function() {
    let usuario;
    let dataAtivacaoMaisRecente;

    before(function(done) {
      TestHelpers.pegarUsuario()
        .then(usu => {
          usuario = usu;
        })
        .then(() => done())
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('obtém lista dos últimos veículos ativados', function(done) {
      Usuario
        .listaVeiculos(usuario.id)
        .then(lista => {
          should.exist(lista);
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('obtém lista com apenas o último veículo ativado', function(done) {
      Usuario
        .listaVeiculos(usuario.id, moment().utc(), 1)
        .then(lista => {
          should.exist(lista);
          lista.length.should.equal(1);
          dataAtivacaoMaisRecente = lista[0].ultima_ativacao;
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('obtém lista com apenas os 2 veículos ativados antes do primeiro', function(done) {
      Usuario
        .listaVeiculos(usuario.id, dataAtivacaoMaisRecente, 1)
        .then(lista => {
          should.exist(lista);
          lista.length.should.equal(1);
          lista[0].ultima_ativacao.should.be.below(dataAtivacaoMaisRecente);
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('extratoFinanceiro()', function() {
    let usuario;
    let transacaoMaisRecente;

    before(function(done) {
      TestHelpers.pegarUsuario()
        .then(usu => {
          usuario = usu;
        })
        .then(() => done())
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });

    it('obtém extrato financeiro', function(done) {
      Usuario
        .extratoFinanceiro(usuario.id)
        .then(lista => {
          should.exist(lista);
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('obtém extrato com apenas a transação mais recente', function(done) {
      Usuario
        .extratoFinanceiro(usuario.id, moment().utc(), 1)
        .then(lista => {
          should.exist(lista);
          lista.length.should.equal(1);
          transacaoMaisRecente = lista[0].data;
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('obtém extrato com as 15 transações que precederam a primeira', function(done) {
      Usuario
        .extratoFinanceiro(usuario.id, transacaoMaisRecente, 8)
        .then(lista => {
          should.exist(lista);
          lista.length.should.equal(8);
          lista[0].data.should.be.below(transacaoMaisRecente);
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

});
