'use strict';

var should = require('chai').should();
var TestHelpers = require('../helpers/test');
var AreaAzul = require('../areaazul');
var MovimentacaoConta = AreaAzul.models.MovimentacaoConta;
var UsuarioHasVeiculo = AreaAzul.models.UsuarioHasVeiculo;

describe('model.usuario_has_veiculo', function() {
  var idUsuarioComum = null;
  var idVeiculo = null;

  before(function(done) {
  return TestHelpers.pegarVeiculo()
        .then(function(veiculo) {
          idVeiculo = veiculo.id;
        })
        .then(function() {
          return TestHelpers.pegarUsuario()
                .then(function(usuario) {
                  idUsuarioComum = usuario.id;
                });
        })
        .then(function() {
          done();
        })
        .catch(function(e) {
          console.dir(e);
          done(e);
        });
  });

  describe('inserir()', function() {
    it('insere usuario has veiculo', function(done) {
      var usuario_has_veiculo = {
        usuario_pessoa_id: activation.usuario_pessoa_id,
        veiculo_id: activation.veiculo_id,
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
