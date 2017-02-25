'use strict';

const express = require('express');
const load = require('express-load');
const logger = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const passport = require('passport');
const basicAuthentication = require('./basic-authentication');

app.get('/robots.txt', function(req, res) {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

passport.use(new basicAuthentication.FiscalBasicStrategy({}));
passport.use(new basicAuthentication.UsuarioBasicStrategy({}));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

// CORS API
app.use(function(req, res, next) {
  // Solution from [http://stackoverflow.com/questions/30761154]
  res.set({
    'Access-Control-Allow-Origin': req.get('Origin') || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'Access-Control-Expose-Headers': 'Content-Length',
    'Access-Control-Allow-Headers': 'Accept, Authorization, Content-Type, X-Requested-With, Range'
  });
  if (req.method === 'OPTIONS') {
    return res.send(200);
  }
  return next();
});

// Controller - Rotas
load('controllers').then('routes').into(app, passport);

module.exports = app;
