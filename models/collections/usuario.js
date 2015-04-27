var Bookshelf = require('bookshelf').conexaoMain;
var Usuario = require("../models/usuario");

module.exports = Bookshelf.Collection.extend({
    model: Usuario.Usuario
});