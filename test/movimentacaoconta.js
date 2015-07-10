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
  var movimentacaoContaId = null;

  function apagarDadosDeTeste() {
    console.log("movimentacaoconta id");
    return TestHelpers.apagarMovimentacaoConta(movimentacaoContaId)
          .then(function() {
            return TestHelpers.apagarUsuarioPorLogin(loginDeTeste);
          });
  }

  before(function(done) {
    apagarDadosDeTeste()
      .then(function() {
        return Usuario.cadastrar({
          login: loginDeTeste,
          senha: senhaDeTeste,
          nome: 'usuario teste',
          email: 'teste-unitario@areaazul.org',
          telefone: '0',
          cpf: '757',
          data_nascimento: new Date(1981, 4, 1),
          sexo: 'feminino',
        })
        .then(function(usuario) {
          console.log("usuario.id" + usuario.id);
          usuarioId = usuario.id;
          done();
        })
        .then(function() {
          done();
        })
        .catch(function(e) {
          done(e);
        });
      });
  }); 



  describe('_inserirCredito()', function() {
    it('insere credito na conta', function(done) {
      var conta = {
        valor: 100.00,
        pessoa_id: usuarioId,
        tipo: 'Cartão de credito',
      };

      MovimentacaoConta
        ._inserirCredito(conta)
        .then(
          function(movimentacaoconta) {
          movimentacaoContaId = movimentacaoconta.get('id_movimentacao_conta');
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });

  /*
   describe('_creditarValor()', function(){
    it('credita o valor da conta', function(done){
        var conta = {
            valor: 10.00,
            pessoa_id: usuarioId,
        };

        MovimentacaoConta
        ._debitarValor(conta)
        .then(
          function(movimentacaoconta) {    
          movimentacaoContaId = movimentacaoconta.id;
          console.log('movimentacao _creditarValor :  '+movimentacaoconta.id);
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
   });
*/
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