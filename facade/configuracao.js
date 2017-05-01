/**
 * Created by flavio on 10/10/16.
 */
const Bookshelf = require('../database');
const Configuracao = Bookshelf.model('Configuracao');

module.exports.alterar = camposConfig =>
  Bookshelf.transaction(t => Configuracao
    ._alterar(camposConfig, { transacting: t })
    .then(configuracao => configuracao.toJSON()));

module.exports.buscar = () =>
  Bookshelf.transaction(t =>
    Configuracao
      ._buscar({ transacting: t })
      .then(configuracao => configuracao.toJSON()));
