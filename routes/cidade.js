'use strict';

var passport = require('passport');

module.exports = function(app) {
  app.get('/cidade',
    app.controllers.cidade.listar);
};
