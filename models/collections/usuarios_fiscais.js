const Bookshelf = require('../../database');
const UsuarioFiscal = Bookshelf.model('UsuarioFiscal');

var UsuariosFiscais = Bookshelf.Collection.extend({
  model: UsuarioFiscal,
  listar: function(then, fail) {
    this.query(function(qb) {
      qb
        .join('pessoa', 'pessoa.id','usuario_fiscal.id')
        .join('pessoa_fisica','pessoa_fisica.id','pessoa.id')
        .where('usuario_fiscal.ativo',true)
        .select('pessoa.*','pessoa_fisica.*');
    }).fetch().then(function(collection) {
      then(collection);
    }).catch(function(err) {
      fail(err);
    });
  }
});
Bookshelf.collection('UsuariosFiscais', UsuariosFiscais);

module.exports = UsuariosFiscais;
