var Bookshelf = require('bookshelf').conexaoMain;
var UsuarioHasVeiculo = require('../models/usuario_has_veiculo');

var UsuarioHasVeiculoCollection = Bookshelf.Collection.extend({
  model: UsuarioHasVeiculo,
}, {
listarVeiculos: function(user) {

   return UsuarioHasVeiculoCollection.forge().query(function(qb) {
      qb
        .innerJoin('usuario', function() {
          this.on('usuario.pessoa_id', '=','usuario_has_veiculo.usuario_pessoa_id');
        })
        .innerJoin('pessoa', function() {
          this.on('pessoa.id_pessoa', '=', 'usuario.pessoa_id');
        })
        .innerJoin('pessoa_fisica', function() {
          this.on('pessoa_fisica.pessoa_id', '=', 'pessoa.id_pessoa');
        })
        .innerJoin('veiculo', function() {
          this.on('veiculo.id_veiculo', '=', 'usuario_has_veiculo.veiculo_id');
        })
        .where('usuario.pessoa_id', user)
        .select('veiculo.*')
        .select('usuario.*')
        .select('pessoa_fisica.*')
        .select('pessoa.*');
        console.log("Select: "+qb);
        }).fetch().then(function(collection) {
          return collection;
        });

      },

});

module.exports = UsuarioHasVeiculoCollection;


/*select      * 
from        usuario_has_veiculo
inner join      usuario on usuario.pessoa_id = usuario_has_veiculo.usuario_pessoa_id
inner join  pessoa  on pessoa.id_pessoa = usuario.pessoa_id
inner join  pessoa_fisica on pessoa_fisica.pessoa_id = pessoa.id_pessoa
inner join  veiculo on veiculo.id_veiculo = usuario_has_veiculo.veiculo_id*/