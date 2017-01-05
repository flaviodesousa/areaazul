'use strict';

const should = require('chai').should();

const AreaAzul = require('../../areaazul');
const UsuarioHasVeiculo = AreaAzul.facade.UsuarioHasVeiculo;

describe('facade UsuarioHasVeiculo', function() {
  let idUsuarioComum = null;
  let idVeiculo = null;

  before(function() {
    const TestHelpers = require('areaazul-test-helpers')(AreaAzul);
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
          uv.should.have.property('id');
          should.exist(uv.id);
          uv.should.have.property('usuario_id', idUsuarioComum);
          uv.should.have.property('veiculo_id', idVeiculo);
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });

});
