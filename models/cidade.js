'use strict';

const _ = require('lodash');
const log = require('../logging');
const Promise = require('bluebird');
const Diacritics = require('diacritics');
const AreaAzul = require('../areaazul');
const Bookshelf = require('../database');

const Cidade = Bookshelf.Model.extend({
  tableName: 'cidade',
  estado: function() {
    return this.belongsTo('Estado', 'estado_id');
  }
}, {
  _buscarPorId: function(id, options) {
    return new Cidade({ id: id })
      .fetch(_.merge({
        require: true,
        withRelated: [ 'estado' ]
      }, options))
      .catch(Bookshelf.NotFoundError, () => {
        const err = new AreaAzul.BusinessException(
          'Cidade: id não encontrado',
          { id: id });
        log.warn(err.message, err.details);
        throw err;
      });
  }
});
Bookshelf.model('Cidade', Cidade);

const Cidades = Bookshelf.Collection.extend({
  model: Cidade
}, {
  _listar: function(filtro) {
    let termos;
    let idEstado;
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
        termos = Diacritics.remove(filtro.termos)
          .toLocaleLowerCase();
        if (!/^[a-z ]+$/.test(termos)) {
          return Promise.reject(
            new AreaAzul.BusinessException(
              'Termos de busca devem conter apenas letras e espaços',
              { filtro: filtro }));
        }
        termos = '%' + termos.trim()
            .replace(/\s+/g, '%') + '%';
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
      .fetch({ withRelated: 'estado' });
  }
});
Bookshelf.collection('Cidades', Cidades);
