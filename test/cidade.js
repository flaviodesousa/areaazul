'use strict';

var should = require('chai').should();
var app = require('../app');
var superAgent = require('superagent');

describe('/cidade', function() {
  var server;

  before(function(done) {
    server = app.listen(8080, function() {
      done();
    });
  });

  describe('GET', function() {
    it('obtém lista de cidades', function(done) {
      this.slow(1500);
      this.timeout(5000);  // Lista completa de cidades: mais lento
      superAgent
        .get('http://localhost:8080/cidade')
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
