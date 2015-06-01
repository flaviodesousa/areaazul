'use strict';

var should = require('chai').should();
var app = require('../app');
var superagent = require('superagent');
var AreaAzul = require('areaazul');
var UsuarioFiscal = AreaAzul.models.UsuarioFiscal;

describe('/fiscalizacao', function() {
  var fiscalLogin = 'fiscalAPIlogin';
  var fiscalSenha = 'senha';
  var server;

  before(function(done) {
    UsuarioFiscal
      .forge({login: fiscalLogin})
      .fetch()
      .then(function(fiscal) {
        if (fiscal) { return fiscal };
        return UsuarioFiscal
          .cadastrar({
            login: fiscalLogin,
            senha: fiscalSenha,
            cpf: fiscalLogin,
            nome: fiscalLogin,
            email: fiscalLogin + '@areaazul.org',
          });
      })
      .then(function() {
        server = app.listen(8080, function() {
          done();
        });
      })
  });

  after(function(done) {
    server.close();
    done();
  });

  it('registra uma fiscalizacao', function(done) {
    superagent
      .post('http://localhost:8080/fiscalizacao')
      .auth(fiscalLogin, fiscalSenha)
      .send({
        placa: 'AON6189',
        latitude: -19.82864667,
        longitude: -43.96678,
      })
      .end(function(err, res) {
        should.not.exist(err);
        should.exist(res);
        res.ok.should.be.equal(true);
        done();
      });
  });
});
