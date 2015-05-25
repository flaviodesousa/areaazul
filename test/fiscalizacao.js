'use strict';

var should = require('chai').should();
var app = require('../app');
var superagent = require('superagent');

describe('/fiscalizacao', function() {
  var fiscalLogin = 'fiscalAPIlogin';
  var fiscalSenha = 'senha';
  var server;

  before(function(done) {
    server = app.listen(8080, function() {
      done();
    });
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
