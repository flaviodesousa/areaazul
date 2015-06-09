'use strict';

var AreaAzul = require('../areaazul');
var Estado = AreaAzul.models.Estado;

describe('model.estado', function() {

  var nomeEstadoTeste = 'teste-estado';
  var ufTeste = 'TT';
  var IdEstado = null;

function deleteTestData(done) {
    Estado
      .forge({id_estado: IdEstado})
      .fetch()
      .then(function(est) {
        if (est !== null) {
          return est.destroy();
        }
      })
      .then(function() {
        return done();
      })
      .catch(function(e) {
        done(e);
      });
  }


 before(deleteTestData);


  describe('cadastrar()', function() {
    it('grava estados', function(done) {
      Estado
        .cadastrar({
          nome: nomeEstadoTeste,
          uf: ufTeste,
        })
        .then(function(estado) {
          IdEstado = estado.id;
          return done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });

after(deleteTestData);
});
