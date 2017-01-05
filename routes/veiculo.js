'use strict';

module.exports = function(app) {
  app.get('/veiculo',
    app.controllers.veiculo.buscarPorPlaca);
  app.get('/veiculo/:veiculo_id',
    app.controllers.veiculo.buscarPorId);
};
