'use strict';

const AreaAzul = require('areaazul');

module.exports.buscarPorPlaca = function(req, res) {
  var placa;
  if (!req.query.placa) {
    res.status(404).end();
    return;
  }
  placa = req.query.placa;
  AreaAzul.facade.Veiculo
    .buscarPorPlaca(placa)
    .then(function(veiculo) {
      res.send(veiculo);
    })
    .catch(AreaAzul.BusinessException, () => {
      res.status(404).end();
    })
    .catch(function(error) {
      res.status(400).send('' + error);
    });
};

module.exports.buscarPorId = function(req, res) {
  AreaAzul.facade.Veiculo
    .buscarPorId(req.params.veiculo_id)
    .catch(AreaAzul.BusinessException, function() {
      res.status(404).end();
    })
    .then(function(veiculo) {
      res.send(veiculo);
    });
};
