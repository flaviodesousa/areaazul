'use strict';

const _ = require('lodash');
const log = require('../../logging');
const AreaAzul = require('../../areaazul');
const Bookshelf = require('../../database');

var Cidade = Bookshelf.Model.extend({
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

module.exports = Cidade;
