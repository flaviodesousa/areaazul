'use strict';

const should = require('chai').should();

const AreaAzul = require('../areaazul');
const UsuarioHasVeiculo = AreaAzul.facade.UsuarioHasVeiculo;

describe('facade UsuarioHasVeiculo', function() {
  var idUsuarioComum = null;
  var idVeiculo = null;

  before(function() {
    const Bookshelf = require('../database');
    const TestHelpers = require('areaazul-test-helpers')(AreaAzul, Bookshelf);
    return TestHelpers
      .pegarVeiculo()
      .then(function(veiculo) {
        idVeiculo = veiculo.id;
      })
      .then(function() {
        return TestHelpers.pegarUsuario();
      })
      .then(function(usuario) {
        idUsuarioComum = usuario.id;
      });
  });

  describe('inserir()', function() {
    it('insere usuario has veiculo', function(done) {
      UsuarioHasVeiculo
        .cadastrar({
          usuario_id: idUsuarioComum,
          veiculo_id: idVeiculo,
          ultima_ativacao: new Date()
        })
        .then(function(uv) {
          should.exist(uv);
          should.exist(uv.id);
          uv.get('usuario_id').should.equal(idUsuarioComum);
          uv.get('veiculo_id').should.equal(idVeiculo);
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });

});
