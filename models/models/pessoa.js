var Bookshelf = require('bookshelf').conexaoMain;
var PesquisaPessoa = require("./pessoa");
var validator = require("validator");
var util = require('../../helpers/util');
var Recuperacao_senha = require('./recuperacao_senha');

var Pessoa = Bookshelf.Model.extend({
  tableName: 'pessoa',
  idAttribute: 'id_pessoa'
});

exports.Pessoa = Pessoa;


exports.verificaEmail = function(person, then, fail) {
    var _uuid = util.geradorUUIDAleatorio();
    Pessoa.forge({email: person.email})
      .fetch()
      .then(function(model) {
        if (model !== null) {
          Recuperacao_senha.cadastrar({uuid: _uuid, pessoa_id: model.attributes.id_pessoa},
            function(result) {
              util.enviarEmailNovaSenha(person.email, model.attributes.nome, _uuid);
              then(model);
            }, 
            function(result) {
              throw new Error("Erro !!!");
            }); 
          
        }else {
          throw new Error("Email não existe!!!");
        }
      })
      .catch(function(err) {
        fail(err);
      });
  };