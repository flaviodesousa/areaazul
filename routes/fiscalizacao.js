'use strict';

const AreaAzul = require('../areaazul');

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
        .catch(function(result) {
          res.status(400)
            .send('' + result);
        });
    });


  app.get('/fiscalizacao', function(req, res) {
    AreaAzul.facade.Fiscalizacao
      .listar()
      .then(function(fiscalizacoes) {
        res.send(fiscalizacoes);
      })
      .catch(function(result) {
        res.status(400)
          .send('' + result);
      });
  });


};
