'use strict';

const debug = require('debug')('areaazul-api-web:controller:veiculo');
const should = require('chai').should();
const app = require('../app');
const superAgent = require('superagent');
const AreaAzul = require('areaazul');
const TestHelpers = require('areaazul-test-helpers')(AreaAzul);
const Bookshelf = AreaAzul.db;
const Veiculo = Bookshelf.model('Veiculo');

describe('/veiculo', function() {
  var server;
  var usuario;
  var veiculoExistente;
  const placaVeiculoNaoExistente = 'API0000';
  const port = 8080;
  const url = `http://localhost:${port}/veiculo`;

  before(function(done) {
    TestHelpers
      .pegarUsuario()
      .then(function(u) {
        usuario = u;
        return TestHelpers
          .pegarVeiculo();
      })
      .then(function(v) {
        veiculoExistente = v;
        return Veiculo
          .procurarVeiculo(placaVeiculoNaoExistente);
      })
      .then(function(v) {
        if (v) {
          // Apagar veiculo caso exista (para ficar não existente)
          return TestHelpers
            .apagarVeiculoPorPlaca(placaVeiculoNaoExistente);
        }
      })
      .then(function() {
        server = app.listen(port, function() {
          done();
        });
      })
      .catch(function(e) {
        debug('erro inesperado', e);
        done(e);
      });
  });

  describe('GET /veiculo/:id', function() {
    it('obtém veículo com id existente', function(done) {
      superAgent
        .get(`${url}/${veiculoExistente.id}`)
        .auth(usuario.get('login'), usuario.senha)
        .end(function(err, res) {
          should.not.exist(err);
          should.exist(res);
          res.should.have.property('body');
          res.body.should.have.property('placa', veiculoExistente.get('placa'));
          res.ok.should.be.equal(true);
          done();
        });
    });
  });

  describe('GET /veiculo?%QUERY%', function() {
    it('obtém veículo existente pela placa', function(done) {
      superAgent
        .get(`${url}?placa=${veiculoExistente.get('placa')}`)
        .auth(usuario.get('login'), usuario.senha)
        .end(function(err, res) {
          should.not.exist(err);
          should.exist(res);
          res.should.have.property('body');
          res.body.should.have.property('placa', veiculoExistente.get('placa'));
          res.ok.should.be.equal(true);
          done();
        });
    });
    it('não obtém veículo inexistente pela placa', function(done) {
      superAgent
        .get(`${url}?placa=${placaVeiculoNaoExistente}`)
        .end(function(err, res) {
          should.exist(err);
          err.status.should.be.equal(404);
          should.exist(res);
          res.statusCode.should.be.equal(404);  // Not found
          done();
        });
    });
    it('retorna não encontrado se não houver placa', function(done) {
      superAgent
        .get(`${url}`)
        .end(function(err, res) {
          should.exist(err);
          err.status.should.be.equal(404);
          should.exist(res);
          res.statusCode.should.be.equal(404);  // Not found
          done();
        });
    });
  });

  after(function(done) {
    server.close();
    done();
  });

});
