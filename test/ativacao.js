'use strict';

var should = require('chai').should();
var TestHelpers = require('../helpers/test');
var AreaAzul = require('../areaazul');
var Ativacao = AreaAzul.models.Ativacao;
var Ativacoes = AreaAzul.collections.Ativacoes;

describe('model.Ativacao', function() {

  var idUsuarioComum = null;
  var idVeiculo = null;
  var idCidade = null;
  var idUsuarioRevendedor = null;
  var idAtivacao = null;


  before(function(done) {
      return TestHelpers
      .pegarVeiculo()
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
            return TestHelpers.pegarUsuarioRevendedor()
                  .then(function(revendedor) {
                    idUsuarioRevendedor = revendedor.id;
                  });
          })
          .then(function() {
            return TestHelpers.pegarCidade()
                  .then(function(cidade) {
                    idCidade = cidade.id;
                  });
          })
          .then(function() {
            done();
          })
          .catch(function(e) {
            done(e);
          });
  });



  describe('Ativar()', function() {
    it('grava ativacao', function(done) {
      var ativacao = {
        usuario_pessoa_id: idUsuarioComum,
        veiculo_id: idVeiculo,
        valor: 10.0,
      };

      Ativacao
          .ativar(ativacao)
                .then(function(at) {
                  should.exist(at);
                  should.exist(at.id);
                  idAtivacao = at.id;
                  done();
                })
                .catch(function(e) {
                  done(e);
                });
    });
  });



  describe('desativar()', function() {


    it('falha para ativacao inexistente', function(done) {
      Ativacao
                .desativar({
                  id_ativacao: 0,
                  usuario_pessoa_id: idUsuarioComum,
                })
                .then(function() {
                  done('Nao deveria ter desativado uma ativacao inexistente');
                })
                .catch(function(e) {
                  should.exist(e);
                  done();
                });
    });
    it('falha se usuario diferente do ativador', function(done) {
      Ativacao
        .desativar({
          id_ativacao: idAtivacao,
          usuario_pessoa_id: 0,
        })
        .then(function() {
          done('Nao deveria ter desativado com usuario diferente');
        })
        .catch(function(e) {
          should.exist(e);
          done();
        });
    });
    it('desativa ativacao existente', function(done) {
      Ativacao
        .desativar({
          id_ativacao: idAtivacao,
          usuario_pessoa_id: idUsuarioComum,
        })
        .then(function() {
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });

  describe('ativarPelaRevenda()', function() {
    it('grava ativacao', function(done) {
      Ativacao
        .ativarPelaRevenda({
          usuario_pessoa_id: idUsuarioRevendedor,
          cidade: idCidade,
          placa: 'ABC-1234',
          marca: 'marcaTeste',
          modelo: 'modeloTeste',
          cor: 'corTeste',
          tipo_veiculo: 1,
          tempo: 60,
          valor: 10.0,
        })
        .then(function(ativacao) {
          ativacao.destroy();
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });

  describe('listarAtivacoes()', function() {

    it('lista veiculos que estão ativados e não estao fiscalizados.', function(done) {
      Ativacoes._listarAtivacoes()
                .then(function() {
                  done();
                })
                .catch(function(e) {
                  done(e);
                });
    });
  });

});
