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
      res.status(500).send('Ainda nao implementado');
    },
    activations_add: function(req, res) {
      res.status(500).send('Ainda nao implementado');
    },
    activations_list: function(req, res) {
      res.status(500).send('Ainda nao implementado');
    },
    deactivations_add: function(req, res) {
      res.status(500).send('Ainda nao implementado');
    },
  };
};
