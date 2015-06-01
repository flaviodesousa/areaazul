'use strict';

var passport = require('passport');
var util = require('util');
var BasicStrategy = require('passport-http').BasicStrategy;

var AreaAzul = require('areaazul');
var UsuarioFiscal = AreaAzul.models.UsuarioFiscal;
var Usuario = AreaAzul.models.Usuario;

function fiscalVerify(username, password, done) {
  process.nextTick(function() {
    UsuarioFiscal.autorizado(username, password)
      .then(function(usuarioFiscal) {
        return done(null, {
          username: username,
          id: usuarioFiscal.get('pessoa_id'),
          usuarioFiscal: usuarioFiscal,
        });
      })
      .catch(function(err) {
        if (err.authentication_event) {
          return done(null, false);
        }
        return done(err);
      });
  });
}

function FiscalBasicStrategy(options) {
  passport.Strategy.call(this);
  this.name = 'basic-fiscal';
  this._verify = fiscalVerify;
  this._realm = options.realm || 'Users';
  this._passReqToCallback = options.passReqToCallback;
}

util.inherits(FiscalBasicStrategy, BasicStrategy);

function usuarioVerify(username, password, done) {
  process.nextTick(function() {
    Usuario
      .autorizado(username, password)
      .then(function(usuario) {
        return done(null, {
          username: username,
          id: usuario.id,
          usuario: usuario.toJSON(),
        });
      })
      .catch(function(err) {
        if (err.authentication_event) {
          return done(null, false);
        }
        return done(err);
      });
  });
}

function UsuarioBasicStrategy(options) {
  passport.Strategy.call(this);
  this.name = 'basic-usuario';
  this._verify = usuarioVerify;
  this._realm = options.realm || 'Users';
  this._passReqToCallback = options.passReqToCallback;
}

util.inherits(UsuarioBasicStrategy, BasicStrategy);

exports.FiscalBasicStrategy = FiscalBasicStrategy;
exports.UsuarioBasicStrategy = UsuarioBasicStrategy;
