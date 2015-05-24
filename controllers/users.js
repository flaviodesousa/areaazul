'use strict';

module.exports = function() {
  return {
    login: function(req, res) {
      res.send(req.user);
    },
    equipment_add: function(req, res) {
      res.status(200).end();
    },
    vehicles_list: function(req, res) {
      req.user.usuario.getVeiculos()
        .then(function(veiculos) {
          res.json(veiculos);
        })
        .catch(function() {
          res.status(500).end();
        });
    },
    vehicles_add: function(req, res) {
      req.user.usuario.addVeiculo({
        placa: req.body.placa,
      })
        .then(function(veiculo) {
          res.json(veiculo);
        })
        .catch(function() {
          res.status(500).end();
        });
    },
    activations_add: function(req, res) {
      req.user.usuario.ativar({
        veiculo_id: req.body.veiculo_id,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        altitude: req.body.altitude,
      }, function(ativacao) {
        res.status(200).json({id: ativacao.id});
      }, function() {
        res.status(500).end();
      });
    },
    activations_list: function(req, res) {
      req.user.usuario.ativacoes()
        .then(function(ativacoes) {
          res.json(ativacoes);
        })
        .catch(function() {
          res.status(500).end();
        });
    },
    deactivations_add: function(req, res) {
      req.user.usuario.desativar({
        veiculo_id: req.body.veiculo_id,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        altitude: req.body.altitude,
      }, function() {
        res.status(200).end();
      }, function() {
        res.status(500).end();
      });
    },
  };
};
