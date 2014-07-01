var Bookshelf = require('bookshelf').conexaoMain;
var Usuario = require("../models/usuario");

module.export = Bookshelf.Collection.extend({
    model: Usuario.Usuario
});