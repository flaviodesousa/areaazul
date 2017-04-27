'use strict';

const AreaAzul = require('../areaazul');

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
      .catch(AreaAzul.BusinessException, () => {
        res.status(404)
          .end();
      })
      .catch(function(error) {
        res.status(400)
          .send('' + error);
      });
  });


  app.get('/veiculo/:veiculo_id', function(req, res) {
    AreaAzul.facade.Veiculo
      .buscarPorId(req.params.veiculo_id)
      .then(function(veiculo) {
        res.send(veiculo);
      })
      .catch(AreaAzul.BusinessException, function() {
        res.status(404)
          .end();
      });
  });
};
