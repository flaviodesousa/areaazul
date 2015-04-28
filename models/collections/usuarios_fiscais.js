var Bookshelf = require('bookshelf').conexaoMain;
var UsuarioFiscal = require("../models/usuario_fiscal");

module.exports = Bookshelf.Collection.extend({
  model: UsuarioFiscal,
  listar: function(then, fail) {
    this.query(function(qb) {
      qb
        .join('pessoa', 'pessoa.id_pessoa','=','usuario_fiscal.pessoa_id')
        .join('pessoa_fisica','pessoa_fisica.pessoa_id','=','pessoa.id_pessoa')
        .where('usuario_fiscal.ativo','=','true')
        .select('pessoa.*','pessoa_fisica.*');
    }).fetch().then(function(collection) {
        then(collection);
    }).catch(function(err){
        fail(err);
    });
  }
});