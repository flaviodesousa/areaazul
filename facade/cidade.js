/**
 * Created by flavio on 10/10/16.
 */

const Bookshelf = require('../database');
const Cidade = Bookshelf.model('Cidade');
const Cidades = Bookshelf.collection('Cidades');

module.exports.listar = filtro =>
  Cidades
    ._listar(filtro)
    .then(cidades => cidades.toJSON());

module.exports.buscarPorId = id =>
  Cidade
    ._buscarPorId(id, null)
    .then(cidade => cidade.toJSON());

