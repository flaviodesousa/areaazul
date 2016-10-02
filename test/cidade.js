'use strict';

const debug = require('debug')('areaazul-api-web:controller:cidade');
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
