/**
 * Created by flavio on 4/20/17.
 */
'use strict';

const AreaAzul = require('../areaazul');
const APIHelper = require('../helpers/api_helpers');

module.exports = function(app) {


  app.get('/configuracao', (req, res) =>
    AreaAzul.facade.Configuracao
      .buscar()
      .then(function(configuracao) {
        res.send(configuracao);
      })
      .catch(AreaAzul.BusinessException, be => APIHelper.status400(res, be))
      .catch(e => APIHelper.status500(res, e, 'erro em GET /configuracao')));


};
