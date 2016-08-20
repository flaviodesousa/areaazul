'use strict';

var should = require('chai').should();
var TestHelpers = require('../helpers/test');
var Bookshelf = require('bookshelf').conexaoMain;
var MovimentacaoConta = Bookshelf.model('MovimentacaoConta');
var UsuarioHasVeiculo = Bookshelf.model('UsuarioHasVeiculo');

describe('model.usuario_has_veiculo', function() {
  var idUsuarioComum = null;
  var idVeiculo = null;

  before(function() {
    return TestHelpers
      .pegarVeiculo()
      .then(function(veiculo) {
        idVeiculo = veiculo.id;
      })
      .then(function() {
        return TestHelpers.pegarUsuario()
      })
      .then(function(usuario) {
        idUsuarioComum = usuario.id;
      });
  });

  describe('inserir()', function() {
    it('insere usuario has veiculo', function(done) {
      var usuario_has_veiculo = {
        usuario_pessoa_id: idUsuarioComum,
        veiculo_id: idVeiculo,
        ultima_ativacao: new Date(),
      };

      UsuarioHasVeiculo
        .cadastrar(usuario_has_veiculo)
        .then(function(uv) {
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });

});
