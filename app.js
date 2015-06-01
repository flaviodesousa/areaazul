'use strict';

var express = require('express');
var load = require('express-load');
var logger = require('morgan');
var bodyParser = require('body-parser');
var app = express();
var passport = require('passport');
var basicAuthentication = require('./basic-authentication');

passport.use(new basicAuthentication.FiscalBasicStrategy({}));
passport.use(new basicAuthentication.UsuarioBasicStrategy({}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(passport.initialize());

// Controler - Rotas
load('controllers').then('routes').into(app, passport);

// CORS API
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var newErr = new Error('Not Found');
  newErr.status = 404;
  next(newErr);
});

// Error handlers

// Development error handler will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500).end();
  });
}

// Production error handler no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500).end();
});

module.exports = app;
