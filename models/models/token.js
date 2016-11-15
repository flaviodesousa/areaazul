'use strict';

const AreaAzul = require('../../areaazul');
const Bookshelf = require('../../database');

const Token = Bookshelf.Model.extend({
  tableName: 'token',
  pessoaFisica: function() {
    return this.belongsTo('PessoaFisica');
  }
}, {
  cadastrar: function(camposToken) {
    return new Token({
      id: camposToken.uuid,
      pessoa_id: camposToken.pessoa_id,
      data_expiracao: new Date(),
      proposito: camposToken.proposito
    })
      .save(null, { method: 'insert' });
  },
  procurar: function(camposToken) {
    new Token({ id: camposToken.id })
      .fetch({ require: true, withRelated: [ 'pessoaFisica.pessoa' ] })
      .catch(Bookshelf.NotFoundError, () => {
        throw new AreaAzul.BusinessException(
          `Token ${camposToken.id} não existe`,
          camposToken);
      });
  }
});
Bookshelf.model('Token', Token);

module.exports = Token;
