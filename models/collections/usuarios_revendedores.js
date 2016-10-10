'use strict';

const Bookshelf = require('../../database');

const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');

var UsuariosRevendedores = Bookshelf.Collection.extend({
  model: UsuarioRevendedor
}, {
  listarUsuarioRevenda: function(idRevendedor) {
    return new UsuariosRevendedores()
      .query({ where: { revendedor_id: idRevendedor } })
      .fetch({ withRelated: [
        'revendedor', 'pessoaFisica', 'pessoaFisica.pessoa' ] });
  }
});
Bookshelf.collection('UsuariosRevendedores', UsuariosRevendedores);

module.exports = UsuariosRevendedores;
