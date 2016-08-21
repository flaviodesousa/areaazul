'use strict';

var should = require('chai').should();
var TestHelpers = require('../helpers/test');
const AreaAzul = require('../areaazul');
const Bookshelf = AreaAzul.db;
var MovimentacaoConta = Bookshelf.model('MovimentacaoConta');

describe('model.movimentacaoConta', function() {
  var usuarioId = null;

  before(function(done) {
    TestHelpers.pegarUsuarioRevendedor()
      .then(function(revendedor) {
        usuarioId = revendedor.id;
      })
      .then(function() {
        done();
      })
      .catch(function(e) {
        console.dir(e);
        done(e);
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
        .then(function() {
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
        .then(function() {
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });

});
