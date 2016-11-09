/**
 * Created by flavio on 10/10/16.
 */

const Promise = require('bluebird');
const Diacritics = require('diacritics');
const AreaAzul = require('../areaazul');
const Bookshelf = require('../database');
const Cidades = Bookshelf.collection('Cidades');

module.exports.listar = function(filtro) {
  var termos;
  var idEstado;
  if (filtro) {
    if (filtro.idEstado) {
      if (isNaN(filtro.idEstado)) {
        return Promise.reject(
          new AreaAzul.BusinessException(
            'idEstado deve ser numérico',
            { filtro: filtro }));
      }
      idEstado = filtro.idEstado;
    }
    if (filtro.termos) {
      termos = Diacritics.remove(filtro.termos);
      if (termos.match(/^[a-z ]+$/)) {
        return Promise.reject(
          new AreaAzul.BusinessException(
            'Termos de busca devem conter apenas letras e espaços',
            { filtro: filtro }));
      }
      termos = '%' + termos.trim().replace(/\s+/g, '%').toLocaleLowerCase() + '%';
    }
  }
  return Cidades
    .query(function(qb) {
      if (idEstado) {
        qb.where({ estado_id: idEstado });
      }
      if (termos) {
        qb.where('nome_busca', 'like', termos);
      }
    })
    .fetch({ withRelated: 'estado' })
    .then(cidades => {
      return cidades.toJSON();
    });
};
