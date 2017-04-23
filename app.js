'use strict';

const debug = require('debug')('areaazul:app');

(() => {
  let missingVars = 0;
  [
    'AREAAZUL_LOG_LEVEL',
    'AREAAZUL_LOG_DIR',
    'AREAAZUL_LOG_FILE_BASE',
    'AREAAZUL_API_ENDPOINT',
    'AREAAZUL_WEB_SECRET',
    'AREAAZUL_EMAIL_USER',
    'AREAAZUL_EMAIL_PASSWORD',
    'AREAAZUL_EMAIL_SMTP_SERVER',
    'AREAAZUL_DB',
    'AREAAZUL_API_PORT'
  ].forEach(envVar => {
    if (!process.env[envVar]) {
      debug(`Variável de ambiente obrigatória '${envVar}' não definida`);
      ++missingVars;
    }
  });
  if (missingVars) {
    process.exit(1);
  }
})();

const express = require('express');
const consign = require('consign');
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

// Controllers - Rotas
consign()
  .include('controllers')
  .then('routes')
  .into(app, passport);

module.exports = app;
