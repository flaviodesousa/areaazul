'use script';

var Pessoa = require('./pessoa').Pessoa;
var PessoaFisica = require('./pessoafisica').PessoaFisica;
var Bookshelf = require('bookshelf').conexaoMain;
var bcrypt = require('bcrypt');
var util = require('./util');
var validator = require('validator');
var _ = require('lodash');


var UsuarioRevendedor = Bookshelf.Model.extend({
  tableName: 'usuario_revendedor',
  idAttribute: 'pessoa_fisica_pessoa_id',
},
{  autorizado: function(login, senha) {
    var UsuarioRevenda = this;
    var err;
    return UsuarioRevenda
      .forge({login: login})
      .fetch()
      .then(function(usuario_revendedor) {


        console.log("usuario_revendedor"+usuario_revendedor);
        if (usuario_revendedor === null) {
          err = new Error('login invalido: ' + login);
          err.authentication_event = true;
          throw err;
        }
        if (util.senhaValida(senha, usuario_revendedor.get('senha'))) {
          return usuario_revendedor;
        } else {
          err = new Error('senha incorreta');
          err.authentication_event = true;
          throw err;
        }
      });
  },

  cadastrar: function(user_reveller) {
    var Usuario_Revendedor = this;
    var usuario_revendedor = null;

    var senha;
    if (!user_reveller.senha) {
      senha = util.criptografa(util.generate());
    } else {
      senha = util.criptografa(user_reveller.senha);
    }

    return Bookshelf.transaction(function(t) {
      var trx = { transacting: t };
      var trxIns = _.merge({}, trx, { method: 'insert' });
      // Verifica se a pessoa fisica ja' existe
      return PessoaFisica
        .forge({cpf: user_reveller.cpf})
        .fetch()
        .then(function(pessoaFisica) {
          // Se pessoa fisica ja' existir, conectar a ela
          if (pessoaFisica !== null) {
            return pessoaFisica;
          }
          // Caso nao exista, criar a pessoa fisica
          return PessoaFisica
            ._cadastrar(user_reveller, trx);
        })
        .then(function(pessoaFisica) {
          return Usuario_Revendedor
            .forge({
              login: user_reveller.login,
              senha: senha,
              primeiro_acesso: true,
              ativo: true,
              autorizacao: user_reveller.autorizacao,
              //revendedor_id: user_reveller.revendedor_id,
              pessoa_fisica_pessoa_id: pessoaFisica.get('pessoa_id'),
            })
            .save(null, trxIns);
        })
        .then(function(u_r) {
          usuario_revendedor = u_r;
          return u_r;
        });
    })
      .then(function() {
        return usuario_revendedor;
      });
  },
  search: function(entidade, func) {
    entidade.fetch().then(function(model, err) {
      if (model !== null)
          var retorno = model.attributes;
      if (err) {
        return func(null);
      }
      func(retorno);
    });
  },

  alterarSenha: function(user, then, fail) {
    new this.Usuario_Revendedor({
      id_usuario_revendedor: user.id_usuario_revendedor
    }).fetch().then(function(model) {
      //   console.log("model"+model.attributes);
      console.log("model" + model);
      if (model !== null) {
        var pwd = model.attributes.senha;
      }
      var hash = bcrypt.compareSync(user.senha, pwd);

      if (hash !== false) {
        var new_senha = util.criptografa(user.nova_senha);

        model.save({
          primeiro_acesso: 'false',
          senha: new_senha,
          ativo: 'true'
        }).then(function(model) {
          then(model);
        }).catch(function(err) {
          fail(err);
        });
      } else {
        fail();
      }
    }).catch(function(err) {
      fail(err);
    });
  },

  validarSenha: function(user) {
    var message = [];
    if (user.nova_senha === null || user.nova_senha === '') {
      message.push({
          attribute: 'nova_senha',
          problem: "Nova senha é obrigatório!"
        });
    }
    if (user.senha === null || user.senha === '') {
      message.push({
          attribute: 'senha',
          problem: "Senha é obrigatório!"
        });
    }
    if (user.conf_senha === null || user.conf_senha === '') {
      message.push({
          attribute: 'conf_senha',
          problem: "Confirmação de senha é obrigatório!"
        });
    }
    if (user.nova_senha  !== user.conf_senha) {
      message.push({
          attribute: 'nova_senha',
          problem: "As senhas devem ser iguais!"
        });
    }
    if (user.senha.length < 4 && user.senha.length > 8) {
      message.push({
          attribute: 'senha',
          problem: "A senha deve conter no minimo 4 a 8 caracteres!"
        });
    }
    if (user.conf_senha.length < 4 && user.conf_senha.length > 8) {
      message.push({
          attribute: 'conf_senha',
          problem: "A confirmação de senha deve conter no minimo 4 a 8caracteres!"
        });
    }
    if (user.nova_senha.length < 4 && user.nova_senha.length  > 8) {
      message.push({
          attribute: 'nova_senha',
          problem: "A nova senha deve conter no minimo 4 a 8 caracteres!"
        });
    }

    for (var i = 0; i < message.length;i++) {
      console.log("Atributo: " + message[i].attribute + " Problem: " + message[i].problem);
    }

    return message;
  },
  validarSenhaAlteracao: function(user) {
    var message = [];

    if (validator.isNull(user.conf_senha)) {
      message.push({
        attribute: 'nova_senha',
        problem: 'Nova senha é obrigatória!',
      });
    }
    if (validator.isNull(user.senha)) {
      message.push({
        attribute: 'senha',
        problem: 'Senha é obrigatória!',
      });
    }

    if (user.senha.length < 4) {
      message.push({
        attribute: 'senha',
        problem: 'A senha deve conter no minimo 4 caracteres!',
      });
    }

    if (user.conf_senha.length < 4) {
      message.push({
        attribute: 'nova_senha',
        problem: 'A nova senha deve conter no minimo 4 caracteres!',
      });
    }
    if (user.conf_senha !== user.senha) {
      message.push({
        attribute: 'nova_senha, senha',
        problem: 'As senhas devem ser iguais!',
      });
    }
    return message;
  },
  alterarSenhaRecuperacao: function(user) {
    new this.Usuario_Revendedor({pessoa_fisica_pessoa_id: user.pessoa_fisica_pessoa_id, })
    .fetch()
    .then(function(model) {
      if (model !== null) {
        var novaSenha = util.criptografa(user.senha);
        model.save({
            primeiro_acesso: 'false',
            senha: novaSenha,
            ativo: 'true',
          }).then(function(model) {
            then(model);
          }).catch(function(err) {
            fail(model.attributes);
          });
      } else {
        throw new Error("Não encontrado!!!");
      }
    })
    .catch(function(err) {
      fail(err);
    });
  }
});

module.exports = UsuarioRevendedor;

exports.compareSenha = function(password, pwd) {
  var hash = bcrypt.compareSync(password, pwd);
  return hash;
};
