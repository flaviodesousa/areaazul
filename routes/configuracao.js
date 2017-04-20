/**
 * Created by flavio on 4/20/17.
 */
'use strict';

const AreaAzul = require('../areaazul');
const log = require('../logging');
const UUID = require('uuid');

module.exports = function(app) {
  app.get('/configuracao', function(req, res) {
    AreaAzul.facade.Configuracao
      .buscar()
      .then(function(configuracao) {
        res.send(configuracao);
      })
      .catch(function(err) {
        const uuid = UUID.v4();
        log.error('erro em GET /configuracao', { err: err, uuid: uuid });
        res.status(400)
          .send(`Error ${uuid}`);
      });
  });
};
