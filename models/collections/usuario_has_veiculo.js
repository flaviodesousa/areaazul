var Bookshelf = require('bookshelf').conexaoMain;
var Usuario_has_Veiculo = require("../models/usuario_has_veiculo");

module.exports = Bookshelf.Collection.extend({
    model: Usuario_has_Veiculo.Usuario_has_Veiculo
});