'use strict';

var PessoaFisica = require('./pessoafisica').PessoaFisica;
var Bookshelf = require('bookshelf').conexaoMain;
var bcrypt = require('bcrypt');
var util = require('../../helpers/util');
var validator = require('validator');
var _ = require('lodash');
var AreaAzul = require('../../areaazul.js');
var log = AreaAzul.log;
var validation = require('./validation');


var UsuarioRevendedor = Bookshelf.Model.extend({
  tableName: 'usuario_revendedor',
  idAttribute: 'pessoa_fisica_pessoa_id',
  pessoaFisica: function() {
    return this.hasOne(PessoaFisica, 'pessoa_id');
  }
}, {
  autorizado: function(login, senha) {
    var UsuarioRevendedor = this;
    var err;
    return UsuarioRevendedor
      .forge({
        login: login
      })
      .fetch()
      .then(function(usuarioRevenda) {
        if (usuarioRevenda === null) {
          err = new AreaAzul.BusinessException(
            'UsuarioRevendedor: login invalido', {
              login: login
            });
          log.warn(err.message, err.details);
          throw err;
        }
        if (util.senhaValida(senha, usuarioRevenda.get('senha'))) {
          return usuarioRevenda;
        }
        err = new AreaAzul.BusinessException(
          'UsuarioRevendedor: senha incorreta', {
            login: login
          });
        log.warn(err.message, err.details);
        throw err;
      });
  },

  _salvarUsuarioRevenda: function(entidade, options, t) {
    var UsuarioRevendedor = this;
    var senha;

    if (!entidade.senha) {
      senha = util.criptografa(util.generate());
    } else {
      senha = util.criptografa(entidade.senha);
      entidade.senha = senha;
    }

    return UsuarioRevendedor
      .validarUsuarioRevenda(entidade, options.method)
      .then(function(messages) {
        if (messages.length) {
          throw new AreaAzul
            .BusinessException(
              'Nao foi possivel cadastrar nova Revenda. Dados invalidos',
              messages);
        }
        return messages;
      })
      .then(function() {
        return PessoaFisica
          .forge({
            cpf: entidade.cpf
          })
          .fetch()
          .then(function(pessoaFisica) {
            if (pessoaFisica !== null) {
              return PessoaFisica.alterar(entidade, t, pessoaFisica.id);
            }
            // Caso nao exista, criar a pessoa fisica
            return PessoaFisica.
            _cadastrar(entidade, t);
          });
      }).then(function(pessoaFisica) {
        var dadosUsuarioRevendedor = {
          login: entidade.login,
          senha: senha,
          autorizacao: entidade.autorizacao,
          acesso_confirmado: false,
          ativo: true,
          revendedor_id: entidade.revendedor_id,
          pessoa_fisica_pessoa_id: pessoaFisica.id,
        };

        if (options.method === 'insert') {
          return UsuarioRevendedor
            .forge(dadosUsuarioRevendedor)
            .save(null, options);
        }
        return UsuarioRevendedor
          .forge()
          .save(dadosUsuarioRevendedor, options);
      });

  },

  _inserir: function(entidade, options, t) {
    return UsuarioRevendedor._salvarUsuarioRevenda(entidade, options, t);
  },

  inserir: function(entidade) {
    return Bookshelf.transaction(function(t) {
      var trx = {
        transacting: t
      };
      var trxIns = _.merge({}, trx, {
        method: 'insert'
      });
      return UsuarioRevendedor._inserir(entidade, trxIns, trx);
    });
  },

  _alterar: function(entidade, options, t) {
    return UsuarioRevendedor._salvarUsuarioRevenda(entidade, options, t);
  },

  alterar: function(entidade) {
    return Bookshelf.transaction(function(t) {
      var trx = {
        transacting: t
      };
      var trxUpd = _.merge({}, trx, {
        method: 'update'
      }, {
        patch: true
      });
      return UsuarioRevendedor._alterar(entidade, trxUpd, trx);
    });
  },


  search: function(entidade, func) {
    entidade.fetch().then(function(model, err) {
      var retorno;
      if (model !== null) {
        retorno = model.attributes;
      }
      if (err) {
        return func(null);
      }
      func(retorno);
    });
  },

  alterarSenha: function(user, then, fail) {
    new this.UsuarioRevendedor({
        id_usuario_revendedor: user.id_usuario_revendedor
      })
      .fetch()
      .then(function(model) {
        var pwd;
        var newSenha;
        if (model !== null) {
          pwd = model.attributes.senha;
        }
        var hash = bcrypt.compareSync(user.senha, pwd);

        if (hash !== false) {
          newSenha = util.criptografa(user.nova_senha);

          model.save({
            primeiro_acesso: 'false',
            senha: newSenha,
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

  procurar: function(id, func) {
    UsuarioRevendedor.forge()
      .query(function(qb) {
        qb
          .distinct()
          .innerJoin('pessoa_fisica', function() {
            this.on('pessoa_fisica.pessoa_id', '=',
              'usuario_revendedor.pessoa_fisica_pessoa_id');
          })
          .innerJoin('pessoa', function() {
            this.on('pessoa.id_pessoa', '=', 'pessoa_fisica.pessoa_id');
          })
          .where('usuario_revendedor.pessoa_fisica_pessoa_id', id)
          .select('pessoa_fisica.*')
          .select('pessoa.*')
          .select('usuario_revendedor.*');
      }).fetch().then(function(model) {
        func(model);
      });
  },


  desativar: function(id) {
    return UsuarioRevendedor
      .forge({
        pessoa_fisica_pessoa_id: id
      })
      .fetch()
      .then(function(revenda) {
        if (!revenda) {
          var err = new AreaAzul.BusinessException(
            'Desativacao: Usuario não encontrado', {
              pessoa_fisica_pessoa_id: id
            });
          throw err;
        }
        var status;

        if (revenda.get('ativo') === false) {
          status = true;
        } else {
          status = false;
        }
        return revenda
          .save({
            ativo: status
          }, {
            patch: true
          });
      });
  },


  validarSenha: function(user) {
    var message = [];
    if (user.nova_senha === null || user.nova_senha === '') {
      message.push({
        attribute: 'nova_senha',
        problem: 'Nova senha é obrigatório!'
      });
    }
    if (user.senha === null || user.senha === '') {
      message.push({
        attribute: 'senha',
        problem: 'Senha é obrigatório!'
      });
    }
    if (user.conf_senha === null || user.conf_senha === '') {
      message.push({
        attribute: 'conf_senha',
        problem: 'Confirmação de senha é obrigatório!'
      });
    }
    if (user.nova_senha !== user.conf_senha) {
      message.push({
        attribute: 'nova_senha',
        problem: 'As senhas devem ser iguais!'
      });
    }
    if (user.senha.length < 4 && user.senha.length > 8) {
      message.push({
        attribute: 'senha',
        problem: 'A senha deve conter no minimo 4 a 8 caracteres!'
      });
    }
    if (user.conf_senha.length < 4 && user.conf_senha.length > 8) {
      message.push({
        attribute: 'conf_senha',
        problem: 'A confirmação de senha deve conter no minimo 4 a 8caracteres!'
      });
    }
    if (user.nova_senha.length < 4 && user.nova_senha.length > 8) {
      message.push({
        attribute: 'nova_senha',
        problem: 'A nova senha deve conter no minimo 4 a 8 caracteres!'
      });
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
    new this.UsuarioRevendedor({
        pessoa_fisica_pessoa_id: user.pessoa_fisica_pessoa_id,
      })
      .fetch()
      .then(function(model) {
        if (!model) {
          throw new AreaAzul.BusinessException(
            'Usuário não encontrado!', { user: user});
        }
        var novaSenha = util.criptografa(user.senha);
        model.save({
          primeiro_acesso: 'false',
          senha: novaSenha,
          ativo: 'true',
        });
      });
  },

  buscarPorId: function(id) {
    return UsuarioRevendedor
      .forge({
        pessoa_fisica_pessoa_id: id
      })
      .fetch()
      .then(function(u) {
        if (u) {
          return u;
        }
        var err = new AreaAzul.BusinessException(
          'UsuarioRevendedor: id nao encontrado', {
            id: id
          });
        log.warn(err.message, err.details);
        throw err;
      });
  },


  validarUsuarioRevenda: function(userReseller, operacao) {
    var message = [];

    if (!userReseller.nome) {
      message.push({
        attribute: 'nome',
        problem: 'Nome obrigatório!',
      });
    }

    if (!userReseller.email) {
      message.push({
        attribute: 'email',
        problem: 'Email obrigatório!',
      });
    }

    if (!userReseller.login) {
      message.push({
        attribute: 'login',
        problem: 'Login obrigatório!',
      });
    }

    if (!validator.isEmail(userReseller.email)) {
      message.push({
        attribute: 'email',
        problem: 'Email inválido!',
      });
    }

    if (!userReseller.cpf) {
      message.push({
        attribute: 'cpf',
        problem: 'CPF é obrigatório!',
      });

    }

    if (!validation.isCPF(userReseller.cpf)) {
      message.push({
        attribute: 'cpf',
        problem: 'CPF inválido!',
      });
    }

    if (!userReseller.termo_servico) {
      message.push({
        attribute: 'termo_servico',
        problem:
          'Para realizar o cadastro precisa aceitar nossos termos de serviço!',
      });
    }


    return UsuarioRevendedor
      .procurarLogin(userReseller.login)
      .then(function(usuariorevendedor) {
        if (usuariorevendedor && operacao === 'insert') {
          message.push({
            attribute: 'login',
            problem: 'Login já cadastrado!',
          });
        }

        return message;
      });


  },
  procurarLogin: function(login) {
    return this.forge({
      login: login
    }).fetch();
  },


});

module.exports = UsuarioRevendedor;

exports.compareSenha = function(password, pwd) {
  var hash = bcrypt.compareSync(password, pwd);
  return hash;
};
