'use strict';

var passport = require('passport');

module.exports = function(app) {
  app.get('/veiculo',
    app.controllers.veiculo.buscarPorPlaca);
  app.get('/veiculo/:id',
    app.controllers.veiculo.buscarPorId);
};
