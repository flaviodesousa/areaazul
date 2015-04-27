module.exports = function(app) {
  var AreaAzul = require('areaazul');
  var Fiscalizacao = AreaAzul.models.fiscalizacao;

  return {
      login: function(req, res) {
        res.status(500).send("Ainda nao implementado");
      },
      equipment_add: function(req, res) {
        res.status(500).send("Ainda nao implementado");
      },
      vehicles_list: function(req, res) {
        res.status(500).send("Ainda nao implementado");
      },
      activations_add: function(req, res) {
        res.status(500).send("Ainda nao implementado");
      },
      activations_list: function(req, res) {
        res.status(500).send("Ainda nao implementado");
      },
      deactivations_add: function(req, res) {
        res.status(500).send("Ainda nao implementado");
      }
  }
}
