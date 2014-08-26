var Bookshelf = require('bookshelf').conexaoMain;

var Fiscal = Bookshelf.Model.extend({
    tableName: 'estado',
    idAttribute: 'id_estado'
});

exports.Estado = Estado;


exports.cadastrar = function(state, fail, then){

  
  var state = new this.Veiculo({
       'nome': state.nome,
       'uf': state.uf,
       'ativo': 'true'
  });
  console.log(state);
  state.save().then(function(model, err){
        if(err){
          return fail(false);
        } else {
          return then(true)
        }
  })
}