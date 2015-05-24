'use strict';

module.exports = function() {
  var AreaAzul = require('areaazul');
  var Fiscalizacao = AreaAzul.models.Fiscalizacao;
  var Fiscalizacoes = AreaAzul.collections.Fiscalizacoes;

  return {
    registrar: function(req, res) {
      console.log('fiscalizacao-registrar-body');
      console.dir(req.body);
      console.log('fiscal: ' + req.user.username);
      console.dir(req.user);
      Fiscalizacao.cadastrar({
        fiscal_id: req.user.id,
        placa: req.body.placa,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
      }, function(result) {
        console.log('Cadastrado com sucesso!!! id=' + result.id);
        res.status(200).end();
      }, function(result) {
        console.log('Erro ao salvar: ' + result);
        res.status(400).send('' + result);
      });
    },
    listar: function(req, res) {
      Fiscalizacoes.listar(
        undefined,
        function(collection) {
          res.send(collection.toJSON());
        },
        function(result) {
          console.log('Erro ao listar: ' + result);
          res.status(400).send('' + result);
        });
    },
  };
};
