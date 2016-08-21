'use strict';

var debug = require('debug')('areaazul:test:ativacao');
var should = require('chai').should();

const AreaAzul = require('../areaazul');
const Bookshelf = AreaAzul.db;

var TestHelpers = require('../helpers/test');

var Ativacao = Bookshelf.model('Ativacao');
var Ativacoes = Bookshelf.collection('Ativacoes');

describe('model.ativacao', function() {

  var idUsuarioComum = null;
  var veiculo = null;
  var idCidade = null;
  var idUsuarioRevendedor = null;
  var idAtivacao = null;

  before(function() {
    return TestHelpers
      .pegarVeiculo()
      .then(function(v) {
        veiculo = v;
      })
      .then(function() {
        return TestHelpers.pegarUsuario();
      })
      .then(function(usuario) {
        idUsuarioComum = usuario.id;
      })
      .then(function() {
        return TestHelpers.pegarUsuarioRevendedor();
      })
      .then(function(revendedor) {
        idUsuarioRevendedor = revendedor.id;
      })
      .then(function() {
        return TestHelpers.pegarCidade();
      })
      .then(function(cidade) {
        idCidade = cidade.id;
      })
      .then(function() {
        return Ativacao
          .query(function(qb) {
            qb
              .whereNull('data_desativacao')
              .andWhere({ veiculo_id: veiculo.id });
          })
          .destroy();
      })
      .catch(function(e) {
        debug('erro inesperado na before()', e);
        throw e;
      });
  });

  describe('Ativar()', function() {

    it('grava ativacao', function(done) {
      var ativacao = {
        pessoa_fisica_id: idUsuarioComum,
        veiculo_id: veiculo.id,
        valor: 10.0
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
          debug('erro inesperado na ativacao', e);
          done(e);
        });
    });
  });

  describe('desativar()', function() {

    it('falha para ativacao inexistente', function(done) {
      Ativacao
        .desativar({
          id_ativacao: 0,
          pessoa_fisica_id: idUsuarioComum
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
          pessoa_fisica_id: 0
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
          pessoa_fisica_id: idUsuarioComum
        })
        .then(function() {
          done();
        })
        .catch(function(e) {
          debug('erro inesperado na desativacao', e);
          done(e);
        });
    });
  });

  describe('ativarPelaRevenda()', function() {
    it('grava ativacao', function(done) {
      Ativacao
        .ativarPelaRevenda({
          pessoa_fisica_id: idUsuarioRevendedor,
          cidade: idCidade,
          placa: veiculo.get('placa'),
          marca: veiculo.get('marca'),
          modelo: veiculo.get('modelo'),
          cor: veiculo.get('cor'),
          tipo_veiculo: veiculo.get('tipo'),
          tempo: 60,
          valor: 10.0
        })
        .then(function(ativacao) {
          ativacao.destroy();
          done();
        })
        .catch(function(e) {
          debug('erro inesperado na ativacao pela revenda', e);
          done(e);
        });
    });
  });

  describe('listarAtivacoes()', function() {

    it('lista veiculos que estão ativados e não estao fiscalizados.',
      function(done) {
        Ativacoes
          ._listarAtivacoes()
          .then(function() {
            done();
          })
          .catch(function(e) {
            done(e);
          });
      });
  });

});
