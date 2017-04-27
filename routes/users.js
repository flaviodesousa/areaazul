'use strict';

const passport = require('passport');

module.exports = function(app) {


  app.get('/usuario',
    passport.authenticate('basic-usuario', { session: false }),
    function(req, res) {
      res.send(req.user);
    });


  app.get('/usuario/:id_usuario/veiculo',
    passport.authenticate('basic-usuario', { session: false }),
    function(req, res) {
      req.user.usuario.getVeiculos()
        .then(function(veiculos) {
          res.json(veiculos);
        })
        .catch(function() {
          res.status(500)
            .end();
        });
    });


  app.post('/usuario/:id_usuario/veiculo',
    passport.authenticate('basic-usuario', { session: false }),
    function(req, res) {
      req.user.usuario.addVeiculo({ placa: req.body.placa })
        .then(function(veiculo) {
          res.json(veiculo);
        })
        .catch(function() {
          res.status(500)
            .end();
        });
    });


  app.post('/usuario/:id_usuario/ativacao',
    passport.authenticate('basic-usuario', { session: false }),
    function(req, res) {
      req.user.usuario.ativar({
        veiculo_id: req.body.veiculo_id,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        altitude: req.body.altitude
      }, function(ativacao) {
        res.status(200)
          .json({ id: ativacao.id });
      }, function() {
        res.status(500)
          .end();
      });
    });


  app.get('/user/:id_usuario/ativacao',
    passport.authenticate('basic-usuario', { session: false }),
    function(req, res) {
      req.user.usuario.ativacoes()
        .then(function(ativacoes) {
          res.json(ativacoes);
        })
        .catch(function() {
          res.status(500)
            .end();
        });
    });


  app.post('/usuario/:id_usuario/desativacao',
    passport.authenticate('basic-usuario', { session: false }),
    function(req, res) {
      req.user.usuario.desativar({
        veiculo_id: req.body.veiculo_id,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        altitude: req.body.altitude
      }, function() {
        res.status(200)
          .end();
      }, function() {
        res.status(500)
          .end();
      });
    });


};
