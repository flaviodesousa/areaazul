/**
 * Created by flavio on 10/10/16.
 */

const Bookshelf = require('../database');
const Cidade = Bookshelf.model('Cidade');
const Cidades = Bookshelf.collection('Cidades');

module.exports.listar = filtro =>
  Bookshelf.transaction(t =>
    Cidades
      ._listar(filtro, { transacting: t }))
    .then(cidades => cidades.toJSON());

module.exports.buscarPorId = id =>
  Bookshelf.transaction(t =>
    Cidade
      ._buscarPorId(id, { transacting: t }))
    .then(cidade => cidade.toJSON());

