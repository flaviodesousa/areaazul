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
const cors = require('cors');
const helmet = require('helmet');
const consign = require('consign');
const logger = require('morgan');
const bodyParser = require('body-parser');
const app = express();
const passport = require('passport');
const basicAuthentication = require('./basic-authentication');

app.use(cors());
app.use(helmet());

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

// Controllers - Rotas
consign()
  .include('routes')
  .into(app, passport);

module.exports = app;
