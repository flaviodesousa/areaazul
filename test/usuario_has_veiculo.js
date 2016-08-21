'use strict';

var should = require('chai').should();

const AreaAzul = require('../areaazul');
const Bookshelf = AreaAzul.db;

var MovimentacaoConta = Bookshelf.model('MovimentacaoConta');
var UsuarioHasVeiculo = Bookshelf.model('UsuarioHasVeiculo');

var TestHelpers = require('../helpers/test');

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
      UsuarioHasVeiculo
        .cadastrar({
          pessoa_fisica_id: idUsuarioComum,
          veiculo_id: idVeiculo,
          ultima_ativacao: new Date(),
        })
        .then(function(uv) {
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });

});
