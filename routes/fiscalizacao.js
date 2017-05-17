'use strict';

const AreaAzul = require('../areaazul');
const APIHelper = require('../helpers/api_helpers');

const passport = require('passport');

module.exports = function(app) {


  app.post('/fiscalizacao',
    passport.authenticate('basic-fiscal', { session: false }),
    function(req, res) {
      AreaAzul.facade.Fiscalizacao
        .cadastrar({
          usuario_fiscal_id: req.user.id,
          placa: req.body.placa,
          latitude: req.body.latitude,
          longitude: req.body.longitude
        })
        .then(function() {
          res.status(201)
            .end();
        })
        .catch(AreaAzul.BusinessException, be => APIHelper.status400(res, be))
        .catch(e => APIHelper.status500(res, e, 'erro em POST /fiscalizacao'));
    });


  app.get('/fiscalizacao', function(req, res) {
    AreaAzul.facade.Fiscalizacao
      .listar()
      .then(function(fiscalizacoes) {
        res.send(fiscalizacoes);
      })
      .catch(AreaAzul.BusinessException, be => APIHelper.status400(res, be))
      .catch(e => APIHelper.status500(res, e, 'erro em GET /fiscalizacao'));
  });


};
