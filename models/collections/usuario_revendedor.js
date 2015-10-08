var Bookshelf = require('bookshelf').conexaoMain;
var UsuarioRevendedor = require("../models/usuario_revendedor");


var UsuarioRevendedorCollection = Bookshelf.Collection.extend({
  model: UsuarioRevendedor,
}, {
  listarUsuarioRevenda: function(revendedor_id, func, err) {
    this
    .forge()
    .query(function(qb) {
    qb.distinct()
      .innerJoin('pessoa_fisica', function () {
                this.on('pessoa_fisica.pessoa_id', '=','usuario_revendedor.pessoa_fisica_pessoa_id');
            })
            .innerJoin('pessoa', function () {
                this.on('pessoa.id_pessoa', '=', 'pessoa_fisica.pessoa_id');
            });
      qb.where('usuario_revendedor.revendedor_id', revendedor_id)
      console.log("sql"+qb);
    })
    .fetch()
    .then(function(collection) {
      console.dir(collection.models);
      console.log(collection.models);
      func(collection);
    })
    .catch(function(e) {
       console.log("e");
      console.dir(e);
      err(e);
    });
  },
});

module.exports = UsuarioRevendedorCollection;

/* select   *
    
 from     "usuario_revendedor" 

 inner join "pessoa_fisica" on "pessoa_fisica"."pessoa_id" = "usuario_revendedor"."pessoa_fisica_pessoa_id" 

 inner join "pessoa" on "pessoa"."id_pessoa" = "pessoa_fisica"."pessoa_id" */