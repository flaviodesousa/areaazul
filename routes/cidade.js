'use strict';

const AreaAzul = require('../areaazul');
const APIHelper = require('../helpers/api_helpers');

module.exports = function(app) {


  app.get('/cidade', function(req, res) {
    let filtro = {};
    if (req.query.estado) {
      filtro.idEstado = Number(req.query.estado);
    }
    if (req.query.termos) {
      filtro.termos = req.query.termos;
    }
    AreaAzul.facade.Cidade
      .listar(filtro)
      .then(function(listaCidades) {
        res.send(listaCidades);
      })
      .catch(AreaAzul.BusinessException, be => APIHelper.status400(res, be))
      .catch(e => APIHelper.status500(res, e, 'erro em GET /cidade'));
  });


};
