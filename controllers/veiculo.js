'use strict';

const AreaAzul = require('areaazul');
const Bookshelf = AreaAzul.db;

module.exports.buscarPorPlaca = function(req, res) {
  var placa;
  if (!req.query.placa) {
    res.status(404).end();
    return;
  }
  placa = req.query.placa;
  Bookshelf.model('Veiculo')
    .procurarVeiculo(placa)
    .then(function(veiculo) {
      if (!veiculo) {
        return res.status(404).end();
      }
      res.send(veiculo.toJSON());
    })
    .catch(function(error) {
      res.status(400).send('' + error);
    });
};

module.exports.buscarPorId = function(req, res) {
  Bookshelf.model('Veiculo')
    .buscarPorId(req.params.veiculo_id)
    .catch(Bookshelf.NotFoundError, function() {
      res.status(404).end();
    })
    .then(function(veiculo) {
      res.send(veiculo.toJSON());
    });
};
