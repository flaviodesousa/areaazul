'use strict';

var Bookshelf = require('bookshelf').conexaoMain;
var UsuarioHasVeiculo = require('../models/usuario_has_veiculo');

module.exports = Bookshelf.Collection.extend({
  model: UsuarioHasVeiculo,
});
