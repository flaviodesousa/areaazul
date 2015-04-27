var Bookshelf = require('bookshelf').conexaoMain;
var UsuarioFiscal = require("../models/usuario_fiscal");

module.exports = Bookshelf.Collection.extend({
    model: UsuarioFiscal
});