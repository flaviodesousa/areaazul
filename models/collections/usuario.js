var Bookshelf = require('bookshelf').conexaoMain;
var Usuario = require("../models/usuario");

var moment = require('moment');

var UsuarioCollection = Bookshelf.Collection.extend({
    model: Usuario,
}, {


    listar: function(then, fail) {
        UsuarioCollection.forge().query(function(qb) {
            qb.join('pessoa',
                'pessoa.id_pessoa', 'usuario.pessoa_id');
            qb.join('pessoa_fisica',
                'pessoa_fisica.pessoa_id', 'pessoa.id_pessoa');
            qb.where('usuario.ativo', '=', 'true');
            qb.select('usuario.*');
            qb.select('pessoa.*');
            qb.select('pessoa_fisica.*');
        }).fetch().then(function(collection) {
            then(collection);
        }).catch(function(err) {
            fail(err);
        });
    },


});