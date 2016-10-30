/**
 * Created by flavio on 10/10/16.
 */
const Bookshelf = require('../database');
const Configuracao = Bookshelf.model('Configuracao');

module.exports.alterar = camposConfig =>
  Configuracao
    ._alterar(camposConfig)
    .then(configuracao => configuracao.toJSON());

module.exports.buscar = () =>
  Configuracao
    ._buscar()
    .then(configuracao => configuracao.toJSON());
