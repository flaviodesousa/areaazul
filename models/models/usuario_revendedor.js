'use strict';

var bcrypt = require('bcrypt');
var validator = require('validator');
var _ = require('lodash');

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
var log = AreaAzul.log;
var util = require('../../helpers/util');
var validation = require('./validation');

const PessoaFisica = Bookshelf.model('PessoaFisica');

var UsuarioRevendedor = Bookshelf.Model.extend({
  tableName: 'usuario_revendedor',
  pessoaFisica: function() {
    return this.hasOne('PessoaFisica', 'id');
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

  _salvarUsuarioRevenda: function(entidade, options) {
    var UsuarioRevendedor = this;
    var senha;

    if (!entidade.senha) {
      senha = util.criptografa(util.generate());
    } else {
      senha = util.criptografa(entidade.senha);
      entidade.senha = senha;
    }

    return UsuarioRevendedor
      ._validarUsuarioRevenda(entidade, options.method, options)
      .then(function(messages) {
        if (messages.length) {
          throw new AreaAzul
            .BusinessException(
            'Não foi possível cadastrar novo usuário para a revenda.'
            + ' Dados inválidos',
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
              return PessoaFisica.alterar(entidade, pessoaFisica.id, options);
            }
            // Caso nao exista, criar a pessoa fisica
            return PessoaFisica._cadastrar(entidade, options);
          });
      }).then(function(pessoaFisica) {
        var dadosUsuarioRevendedor = {
          login: entidade.login,
          senha: senha,
          autorizacao: entidade.autorizacao,
          acesso_confirmado: false,
          ativo: true,
          revendedor_id: entidade.revendedor_id,
          pessoa_fisica_id: pessoaFisica.id
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
      id: user.id
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
          .innerJoin('pessoa_fisica', 'pessoa_fisica.id',
              'usuario_revendedor.pessoa_fisica_id')
          .innerJoin('pessoa', 'pessoa.id', 'pessoa_fisica.id')
          .where('usuario_revendedor.id', id)
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
        id: id
      })
      .fetch()
      .then(function(revenda) {
        if (!revenda) {
          throw new AreaAzul.BusinessException(
            'Desativacao: Usuario não encontrado', { id: id });
        }
        return revenda
          .save({ ativo: false }, { patch: true });
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
    if (user.senha.length < 8) {
      message.push({
        attribute: 'senha',
        problem: 'A senha deve conter no minimo 8 caracteres!'
      });
    }
    if (user.conf_senha.length < 8) {
      message.push({
        attribute: 'conf_senha',
        problem: 'A confirmação de senha deve conter no minimo 8 caracteres!'
      });
    }

    return message;
  },
  validarSenhaAlteracao: function(user) {
    var message = [];

    if (validator.isNull(user.conf_senha)) {
      message.push({
        attribute: 'nova_senha',
        problem: 'Nova senha é obrigatória!'
      });
    }
    if (validator.isNull(user.senha)) {
      message.push({
        attribute: 'senha',
        problem: 'Senha é obrigatória!'
      });
    }

    if (user.senha.length < 4) {
      message.push({
        attribute: 'senha',
        problem: 'A senha deve conter no minimo 4 caracteres!'
      });
    }

    if (user.conf_senha.length < 4) {
      message.push({
        attribute: 'nova_senha',
        problem: 'A nova senha deve conter no minimo 4 caracteres!'
      });
    }
    if (user.conf_senha !== user.senha) {
      message.push({
        attribute: 'nova_senha, senha',
        problem: 'As senhas devem ser iguais!'
      });
    }
    return message;
  },

  alterarSenhaRecuperacao: function(user) {
    new this.UsuarioRevendedor({ id: user.id })
      .fetch()
      .then(function(model) {
        if (!model) {
          throw new AreaAzul.BusinessException(
            'Usuário não encontrado!', { user: user });
        }
        var novaSenha = util.criptografa(user.senha);
        model.save({
          primeiro_acesso: 'false',
          senha: novaSenha
        });
      });
  },

  buscarPorId: function(id) {
    return new UsuarioRevendedor({ id: id })
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

  _validarUsuarioRevenda: function(userReseller, operacao, options) {
    var message = [];

    if (!userReseller.nome) {
      message.push({
        attribute: 'nome',
        problem: 'Nome obrigatório!'
      });
    }

    if (!userReseller.email) {
      message.push({
        attribute: 'email',
        problem: 'Email obrigatório!'
      });
    } else if (!validator.isEmail(userReseller.email)) {
      message.push({
        attribute: 'email',
        problem: 'Email inválido!'
      });
    }

    if (!userReseller.login) {
      message.push({
        attribute: 'login',
        problem: 'Login obrigatório!'
      });
    }

    if (!userReseller.cpf) {
      message.push({
        attribute: 'cpf',
        problem: 'CPF é obrigatório!'
      });
    } else if (!validation.isCPF(userReseller.cpf)) {
      message.push({
        attribute: 'cpf',
        problem: 'CPF inválido!'
      });
    }

    if (!userReseller.termo_servico) {
      message.push({
        attribute: 'termo_servico',
        problem: 'Cadastro exige aceitar nossos termos de serviço'
      });
    }

    if (!userReseller.revendedor_id) {
      message.push({
        attribute: 'revendedor_id',
        problem: 'Revendedor não definido'
      });
    }

    const Revendedor = Bookshelf.model('Revendedor');
    return new Revendedor({ id: userReseller.revendedor_id })
      .fetch(options)
      .then(function(r) {
        if (!r) {
          message.push({
            attribute: 'revendedor_id',
            problem: 'Revendedor não existe'
          });
        }
        return r;
      })
      .then(function() {
        return UsuarioRevendedor
          ._procurarLogin(userReseller.login, options);
      })
      .then(function(usuariorevendedor) {
        if (usuariorevendedor && operacao === 'insert') {
          message.push({
            attribute: 'login',
            problem: 'Login já cadastrado!'
          });
        }
      })
      .return(message);
  },
  validarUsuarioRevenda: function(usuarioRevendedorFields, operation) {
    return this._validarUsuarioRevenda(usuarioRevendedorFields, operation, {});
  },
  _procurarLogin: function(login, options) {
    return new this({ login: login })
      .fetch(options);
  },
  procurarLogin: function(login) {
    return this._procurarLogin(login, null);
  }
});
Bookshelf.model('UsuarioRevendedor', UsuarioRevendedor);

module.exports = UsuarioRevendedor;
