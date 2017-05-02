'use strict';

const debug = require('debug')('areaazul-api-web:controller:fiscalizacao');
const should = require('chai').should();
const app = require('../../app');
const superagent = require('superagent');

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul._internals.Bookshelf;
const UsuarioFiscalModel = Bookshelf.model('UsuarioFiscal');

describe('/fiscalizacao', function() {
  let server;
  const fiscalTesteAPI = {
    login: 'fiscalAPIlogin',
    nova_senha: 'senhaapi',
    conf_senha: 'senhaapi',
    cpf: '45772838407',
    nome: 'fiscalAPIlogin',
    email: 'fiscalAPIlogin' + '@areaazul.org'
  };

  before(function(done) {
    Bookshelf.transaction(trx =>
      new UsuarioFiscalModel({ login: fiscalTesteAPI.login })
      .fetch({ transacting: trx })
      .then(function(fiscal) {
        if (fiscal) {
          return fiscal;
        }
        return UsuarioFiscalModel
          ._cadastrar(fiscalTesteAPI, { transacting: trx });
      }))
      .then(function() {
        server = app.listen(8080, function() {
          done();
        });
      })
      .catch(function(e) {
        debug('erro inesperado', e);
        done(e);
      });
  });

  describe('POST', function() {
    it('registra uma fiscalização', function(done) {
      superagent
        .post('http://localhost:8080/fiscalizacao')
        .auth(fiscalTesteAPI.login, fiscalTesteAPI.nova_senha)
        .send({
          placa: 'AON6189',
          latitude: -19.82864667,
          longitude: -43.96678
        })
        .end(function(err, res) {
          should.not.exist(err);
          should.exist(res);
          res.ok.should.be.equal(true);
          res.should.have.property('status', 201);
          done();
        });
    });
    it('tenta registrar uma fiscalização com senha inválida', function(done) {
      superagent
        .post('http://localhost:8080/fiscalizacao')
        .auth(fiscalTesteAPI.login, fiscalTesteAPI.nova_senha + 'x')
        .send({
          placa: 'AON6189',
          latitude: -19.82864667,
          longitude: -43.96678
        })
        .end(function(err, res) {
          should.exist(err);
          err.should.have.property('status', 401);
          should.exist(res);
          res.should.have.property('ok', false);
          res.should.have.property('status', 401);
          done();
        });
    });
  });

  describe('GET', function() {
    it('obtém lista de fiscalizações', function(done) {
      superagent
        .get('http://localhost:8080/fiscalizacao')
        .auth(fiscalTesteAPI.login, fiscalTesteAPI.nova_senha)
        .end(function(err, res) {
          should.not.exist(err);
          should.exist(res);
          res.ok.should.be.equal(true);
          done();
        });
    });
  });

  after(function(done) {
    server.close();
    done();
  });

});
