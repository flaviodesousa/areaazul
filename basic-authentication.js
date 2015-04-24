var passport = require('passport')
var util = require('util');
var BasicStrategy = require('passport-http').BasicStrategy;

function fiscalVerify (username, password, done) {
  process.nextTick(function() {
    console.log('u=' + username + '/p=' + password)
    if (username === "valido") {
      return done(null, { username: username, id: 1 });
    }
    return done("usuario não é valido");
  });
};

function FiscalBasicStrategy(options) {
  passport.Strategy.call(this);
  this.name = 'basic-fiscal';
  this._verify = fiscalVerify;
  this._realm = options.realm || 'Users';
  this._passReqToCallback = options.passReqToCallback;
}

util.inherits(FiscalBasicStrategy, BasicStrategy);

exports.FiscalBasicStrategy = FiscalBasicStrategy;