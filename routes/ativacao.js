/**
 * Created by flavio on 4/25/17.
 */

const AreaAzul = require('../areaazul');
const APIHelper = require('../helpers/api_helpers');

module.exports = function(app) {


  app.get('/ativacao', function(req, res) {
    AreaAzul.facade.Ativacao
      .listarAtivacoes()
      .then(function(listaAtivacoes) {
        res.send(listaAtivacoes);
      })
      .catch(AreaAzul.BusinessException, be => APIHelper.status400(res, be))
      .catch(e => APIHelper.status500(res, e, 'erro em GET /ativacao'));
  });


};
