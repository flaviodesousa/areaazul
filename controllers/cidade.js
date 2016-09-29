'use strict';

const AreaAzul = require('areaazul');
const Bookshelf = AreaAzul.db;

module.exports.listar = function (req, res) {
  var estado;
  if (req.query.estado) {
    estado = Number(req.query.estado);
  }
  Bookshelf.collection('Estados')
    .listar(estado)
    .then(function (estados) {
      res.send(estados.toJSON());
    })
    .catch(function (result) {
      res.status(400).send('' + result);
    });
};
