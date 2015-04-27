var Bookshelf = require('bookshelf').conexaoMain;
var UsuarioRevendedor = require("../models/usuario_revendedor");

module.exports = Bookshelf.Collection.extend({
    model: UsuarioRevendedor
});