const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
var validator = require('validator');
var util = require('../../helpers/util');
const RecuperacaoSenha = Bookshelf.model('RecuperacaoSenha');

var Pessoa = Bookshelf.Model.extend({
  tableName: 'pessoa'
}, {
  verificaEmail: function(person, then, fail) {
    var _uuid = util.geradorUUIDAleatorio();
    Pessoa.forge({email: person.email})
      .fetch()
      .then(function(model) {
        if (model !== null) {
          RecuperacaoSenha.cadastrar({uuid: _uuid, pessoa_id: model.attributes.id_pessoa},
            function() {
              util.enviarEmailNovaSenha(person.email, model.attributes.nome, _uuid);
              then(model);
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
