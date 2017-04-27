/**
 * Created by flavio on 4/25/17.
 */

const AreaAzul = require('../areaazul');

module.exports = function(app) {


  app.get('/ativacao', function(req, res) {
    AreaAzul.facade.Ativacao
      .listarAtivacoes()
      .then(function(listaAtivacoes) {
        res.send(listaAtivacoes);
      })
      .catch(function(err) {
        AreaAzul.log.error('Erro obtendo lista de ativações', { error: err });
        res.status(400)
          .end();
      });
  });


};
