/**
 * Created by flavio on 10/10/16.
 */
const Bookshelf = require('../database');
const Configuracao = Bookshelf.model('Configuracao');

module.exports.getConfiguracaoTempo = function() {
  return [ {
    quantidade_tempo: '60',
    preco: 2.00
  }, {
    quantidade_tempo: '120',
    preco: 4.00
  }, {
    quantidade_tempo: '180',
    preco: 6.00
  }, {
    quantidade_tempo: '180',
    preco: 8.00
  } ];
};

module.exports.alterar = camposConfig =>
  Configuracao
    ._alterar(camposConfig)
    .then(configuracao => configuracao.toJSON());

module.exports.buscar = () =>
  Configuracao
    ._buscar()
    .then(configuracao => configuracao.toJSON());
