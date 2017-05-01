'use strict';

var passport = require('passport');
var util = require('util');
var BasicStrategy = require('passport-http').BasicStrategy;

const AreaAzul = require('./areaazul');
const UsuarioFiscal = AreaAzul.facade.UsuarioFiscal;
const Usuario = AreaAzul.facade.Usuario;

function fiscalVerify(username, password, done) {
  process.nextTick(function() {
    UsuarioFiscal.autentico(username, password)
      .then(function(usuarioFiscal) {
        done(null, {
          username: username,
          id: usuarioFiscal.id,
          usuarioFiscal: usuarioFiscal
        });
        return null;
      })
      .catch(AreaAzul.AuthenticationError, function() {
        done(null, false);
        return null;
      })
      .catch(AreaAzul.BusinessException, function() {
        done(null, false);
        return null;
      })
      .catch(function(err) {
        done(err);
        return null;
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
      .autentico(username, password)
      .then(function(usuario) {
        return done(null, {
          username: username,
          id: usuario.id,
          usuario: usuario.toJSON()
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
