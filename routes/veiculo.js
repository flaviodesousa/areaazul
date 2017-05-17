'use strict';

const AreaAzul = require('../areaazul');
const APIHelper = require('../helpers/api_helpers');

module.exports = function(app) {


  app.get('/veiculo', function(req, res) {
    let placa;
    if (!req.query.placa) {
      res.status(404)
        .end();
      return;
    }
    placa = req.query.placa;
    AreaAzul.facade.Veiculo
      .buscarPorPlaca(placa)
      .then(function(veiculo) {
        if (!veiculo) {
          return res.status(404)
            .end();
        }
        res.send(veiculo);
      })
      .catch(AreaAzul.BusinessException, be => APIHelper.status400(res, be))
      .catch(e => APIHelper.status500(res, e, 'erro em GET /veiculo'));
  });


  app.get('/veiculo/:veiculo_id', function(req, res) {
    AreaAzul.facade.Veiculo
      .buscarPorId(req.params.veiculo_id)
      .then(function(veiculo) {
        res.send(veiculo);
      })
      .catch(AreaAzul.BusinessException, be => APIHelper.status400(res, be))
      .catch(e => APIHelper.status500(res, e, 'erro em GET /veiculo/:veiculo_id'));
  });
};
