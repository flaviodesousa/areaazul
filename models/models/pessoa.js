const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
var validator = require('validator');
var util = require('../../helpers/util');
const RecuperacaoSenha = Bookshelf.model('RecuperacaoSenha');

var Pessoa = Bookshelf.Model.extend({
  tableName: 'pessoa'
}, {
  verificaEmail: function(pessoaAVerificar, then, fail) {
    var _uuid = util.geradorUUIDAleatorio();
    Pessoa.forge({email: pessoaAVerificar.email})
      .fetch()
      .then(function(pessoa) {
        if (pessoa !== null) {
          RecuperacaoSenha.cadastrar({
              uuid: _uuid,
              pessoa_id: pessoa.id},
            function() {
              util.enviarEmailNovaSenha(
                pessoaAVerificar.email, pessoa.get('nome'), _uuid);
              then(pessoa);
            },
            function(result) {
              throw new Error('Erro !!!');
            });

        }else {
          throw new Error('Email não existe!!!');
        }
      })
      .catch(function(err) {
        fail(err);
      });
  }
});
Bookshelf.model('Pessoa', Pessoa);

module.exports = Pessoa;
