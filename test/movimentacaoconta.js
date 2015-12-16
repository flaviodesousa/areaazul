'use strict';

var should = require('chai').should();
var TestHelpers = require('../helpers/test');
var AreaAzul = require('../areaazul');
var Usuario = AreaAzul.models.Usuario;
var MovimentacaoConta = AreaAzul.models.MovimentacaoConta;

describe('model.movimentacaoConta', function() {
  var loginDeTeste = 'login-teste-movimentacao-conta';
  var senhaDeTeste = 'senha-teste-movimentacao-conta';
  var usuarioId = null;
  var movimentacaoContaCreditoId = null;
  var movimentacaoContaDebitoId = null;

  function apagarDadosDeTeste() {
    return TestHelpers.apagarMovimentacaoConta(movimentacaoContaCreditoId)
      .then(function() {
        return TestHelpers.apagarMovimentacaoConta(movimentacaoContaDebitoId);
      })
      .then(function() {
        return TestHelpers.apagarUsuarioPorLogin(loginDeTeste);
      });
  }

  before(function(done) {
    apagarDadosDeTeste()
      .then(function() {
          return TestHelpers.pegarUsuarioRevendedor()
                  .then(function(revendedor) {
                    usuarioId = revendedor.id;
          })
          .then(function() {
            done();
          })
          .catch(function(e) {
            done(e);
          });
      });
  });



  describe('inserirCredito()', function() {
    it('insere credito na conta', function(done) {
      var conta = {
        valor: 100.00,
        pessoa_id: usuarioId,
        tipo: 'Cartão de credito',
        historico: 'credito-de-teste',
      };

      MovimentacaoConta
        .inserirCredito(conta)
        .then(function(movimentacaoconta) {
          movimentacaoContaCreditoId = movimentacaoconta.id;
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });

  describe('inserirDebito()', function() {
    it('debita na conta', function(done) {
      var conta = {
        valor: 10.00,
        pessoa_id: usuarioId,
        tipo: 'o-que-eh-esse-tipo?',
        historico: 'debito-de-teste',
      };

      MovimentacaoConta
        .inserirDebito(conta)
        .then(function(movimentacaoconta) {
          movimentacaoContaDebitoId = movimentacaoconta.id;
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });

});
