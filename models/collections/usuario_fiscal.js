var Bookshelf = require('bookshelf').conexaoMain;
var UsuarioFiscal = require("../models/usuario_fiscal");

module.exports = Bookshelf.Collection.extend({
    model: UsuarioFiscal,
    listar: function(then, fail) {
      this.forge().query(function(qb){
           qb.join('pessoa', 'pessoa.id_pessoa','=','usuario_fiscal.pessoa_id');
           qb.join('usuario','usuario.pessoa_id','=','pessoa.id_pessoa');
           qb.join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa');
           qb.where('usuario_fiscal.ativo','=','true');
           qb.where('usuario.autorizacao','=','5');
           qb.select('usuario.*','pessoa.*','pessoa_fisica.*','usuario_fiscal.*');
      }).fetch().then(function(collection) {
          then(collection);
      }).catch(function(err){
          fail(err);
      });
    }

});