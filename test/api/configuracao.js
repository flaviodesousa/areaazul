/**
 * Created by flavio on 4/20/17.
 */

'use strict';

const should = require('chai').should();
const app = require('../../app');
const superAgent = require('superagent');

describe('/configuracao', function() {
  let server;

  before(function(done) {
    server = app.listen(8080, function() {
      done();
    });
  });

  describe('GET', function() {
    it('obtém configuração', function(done) {
      superAgent
        .get('http://localhost:8080/configuracao')
        .end(function(err, res) {
          should.not.exist(err);
          should.exist(res);
          res.ok.should.be.equal(true);
          should.exist(res.body);
          should.exist(res.body.cidade);
          should.exist(res.body.cidade.estado);
          should.exist(res.body.conta);
          should.exist(res.body.parametros);
          done();
        });
    });
  });

  after(function(done) {
    server.close();
    done();
  });

});
