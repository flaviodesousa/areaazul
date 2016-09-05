'use strict';

module.exports = function () {
  var AreaAzul = require('areaazul');
  const Bookshelf = AreaAzul.db;

  return {
    registrar: function (req, res) {
      Bookshelf.model('Fiscalizacao')
        .cadastrar({
          usuario_fiscal_id: req.user.id,
          placa: req.body.placa,
          latitude: req.body.latitude,
          longitude: req.body.longitude
        })
        .then(function () {
          res.status(200).end();
        })
        .catch(function (result) {
          res.status(400).send('' + result);
        });
    },
    listar: function (req, res) {
      var params = {};
      if (req.query.minutos) {
        params.minutos = Number(req.query.minutos);
      }
      if (req.query.limite) {
        params.limite = Number(req.query.limite);
      }
      Bookshelf.collection('Fiscalizacoes')
        .listar(params)
        .then(function (fiscalizacoes) {
          res.send(fiscalizacoes.toJSON());
        })
        .catch(function (result) {
          res.status(400).send('' + result);
        });
    }
  };
};
