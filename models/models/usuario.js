'use strict';

var _ = require('lodash');
var bcrypt = require('bcrypt-then');
var validator = require('validator');

const AreaAzul = require('../../areaazul');
const AreaAzulMailer = require('areaazul-mailer');
const Bookshelf = require('../../database');
const log = require('../../logging');

var PessoaFisica = Bookshelf.model('PessoaFisica');
var Conta = Bookshelf.model('Conta');

var Usuario = Bookshelf.Model.extend({
  tableName: 'usuario',
  pessoaFisica: function() {
    return this.hasOne('PessoaFisica', 'id');
  },
  veiculos: function() {
    return this.hasMany('Veiculo')
      .through('UsuarioHasVeiculo');
  }

}, {

  buscarPorId: function(id) {
    var Usuario = this;

    return Usuario
      .forge({ id: id })
      .fetch()
      .then(function(u) {
        if (u) {
          return u;
        }
        var err = new AreaAzul.BusinessException(
          'Usuário: id não encontrado', {
            id: id
          });
        log.warn(err.message, err.details);
        throw err;
      });
  },

  autorizado: function(login, senha) {
    var usuario;
    return new Usuario({ login: login })
      .fetch()
      .then(function(u) {
        usuario = u;
        if (!usuario) {
          var err = new AreaAzul.BusinessException(
            'Usuário: login inválido', { login: login });
          err.authentication_event = true;
          log.warn(err.message, err.details);
          throw err;
        }
        return bcrypt.compare(senha, usuario.get('senha'));
      })
      .then(function(valid) {
        if (!valid) {
          throw new AreaAzul.AuthenticationError(
            'Usuário: senha incorreta', {
              login: login,
              usuario: usuario
            });
        }
        return usuario;
      });
  },

  _salvar: function(camposUsuario, usuario, options) {
    const optionsInsert = _.merge({ method: 'insert' }, options);
    const optionsUpdate = _.merge({ method: 'update' }, options);
    var Usuario = this;
    var login;
    var hashSenha;
    var pessoaFisica = null;

    if (!camposUsuario.login) {
      login = camposUsuario.cpf;
    } else {
      login = camposUsuario.login;
    }
    return Usuario
      ._camposValidos(camposUsuario, usuario, options)
      .then(function(messages) {
        if (messages.length) {
          throw new AreaAzul
            .BusinessException(
            'Não foi possível cadastrar novo usuário. Dados inválidos',
            messages);
        }
        return messages;
      })
      .then(function() {
        return PessoaFisica
          .forge({
            cpf: camposUsuario.cpf
          })
          .fetch()
          .then(function(pessoaFisica) {
            if (pessoaFisica !== null) {
              return PessoaFisica.alterar(
                camposUsuario, pessoaFisica.id, options);
            }
            return PessoaFisica
              ._cadastrar(camposUsuario, options);
          });
      })
      .then(function(pf) {
        pessoaFisica = pf;
      })
      .then(function() {
        return bcrypt.hash(camposUsuario.nova_senha);
      })
      .then(function(hash) {
        hashSenha = hash;
        if (!usuario) {
          return Conta._cadastrar(null, options);
        }
        return new Conta({ id: usuario.get('conta_id') })
          .fetch(options);
      })
      .then(function(conta) {
        var dadosUsuario = {
          id: pessoaFisica.id,
          login: login,
          senha: hashSenha,
          primeiro_acesso: true,
          conta_id: conta.id,
          ativo: true
        };

        if (!usuario) {
          return new Usuario(dadosUsuario)
            .save(null, optionsInsert);
        }
        return usuario
          .save(dadosUsuario, optionsUpdate);
      })
      .then(function(u) {
        var message = {
          from: 'AreaAzul <cadastro@areaazul.org>',
          to: camposUsuario.email,
          cc: 'cadastro@areaazul.org',
          subject: 'Confirmação de cadastro - AreaAzul',
          html: '<p>Por favor ' + camposUsuario.nome +
          ' clique no link abaixo para acessar a aplicação areaazul.</br>' +
          '<a href="http://usuario.demo.areaazul.org">Área Azul</a></br>' +
          'Usuario: ' + login
        };
        AreaAzulMailer.enviar.emailer(message);
        return u;
      });
  },

  inserir: function(camposUsuario) {
    return Bookshelf.transaction(function(t) {
      return Usuario._salvar(camposUsuario, null, { transacting: t });
    });
  },

  alterar: function(camposUsuario, usuario) {
    return Bookshelf.transaction(function(t) {
      return Usuario._salvar(camposUsuario, usuario, { transacting: t });
    });
  },

  _alterarSenha: function(camposAlterarSenha, options) {
    var usuario = null;
    return new Usuario({ id: camposAlterarSenha.id })
      .fetch(_.merge({ require: true }, options))
      .catch(Bookshelf.NotFoundError, () => {
        throw new AreaAzul
          .BusinessException(
          `Usuário "${camposAlterarSenha.id}" não reconhecido`,
          { usuarioId: camposAlterarSenha.id });
      })
      .then(function(u) {
        usuario = u;
        return Usuario
          ._senhaValida(camposAlterarSenha, usuario);
      })
      .then(function(messages) {
        if (messages.length) {
          throw new AreaAzul
            .BusinessException(
            'Não foi possível cadastrar novo usuário. Dados inválidos',
            messages);
        }
        var pwd = usuario.get('senha');
        return bcrypt.compare(camposAlterarSenha.senha, pwd);
      })
      .then(function(valid) {
        if (!valid) {
          throw new AreaAzul.AuthenticationError(
            'Senha atual incorreta. Senha não alterada',
            { usuario: usuario });
        }
        return bcrypt.hash(camposAlterarSenha.nova_senha);
      })
      .then(function(hashNovaSenha) {
        return usuario.save(
          { senha: hashNovaSenha },
          _.merge({ method: 'update', patch: true }, options));
      });
  },

  alterarSenha: function(camposAlterarSenha) {
    return Bookshelf.transaction(function(t) {
      return Usuario
        ._alterarSenha(camposAlterarSenha, { transacting: t });
    });
  },

  _camposValidos: function(camposUsuario, usuario, options) {
    var messages = Usuario._loginValido(camposUsuario);
    messages.concat(Usuario._senhaValida(camposUsuario, usuario));

    return PessoaFisica
      ._camposValidos(camposUsuario, options)
      .then(function(messagesPessoaFisica) {
        messages.concat(messagesPessoaFisica);
      })
      .then(function() {
        return PessoaFisica
          ._buscarPorCPF(camposUsuario.cpf, options);
      })
      .then(function(pessoaFisica) {
        if (pessoaFisica) {
          if (!usuario) {
            messages.push({
              attribute: 'cpf',
              problem: 'CPF já cadastrado!'
            });
          } else if (usuario.id !== pessoaFisica.id) {
            messages.push({
              attribute: 'cpf',
              problem: 'CPF já em uso por outro usuário!'
            });
          }
          // Casos válidos:
          // - usuario.id === pessoaFisica.id: mesmo cpf
        }
        // Casos válidos:
        // - !pessoaFisica: cpf ainda não usado
        return messages;
      });
  },

  _loginValido: function(user) {
    var message = [];
    if (!user.login || validator.isNull(user.login)) {
      message.push({
        attribute: 'login',
        problem: 'Login é obrigatório!'
      });
    } else if ((user.login.length < 4) || (user.login.length > 32)) {
      message.push({
        attribute: 'login',
        problem: 'O nome de login deve conter de 4 a 32 caracteres'
      });
    }
    return message;
  },


  _senhaValida: function(camposUsuario) {
    var message = [];

    if (!camposUsuario.nova_senha
      || validator.isNull(camposUsuario.nova_senha)) {
      message.push({
        attribute: 'nova_senha',
        problem: 'Senha é obrigatória!'
      });
    } else if (camposUsuario.nova_senha !== camposUsuario.conf_senha) {
      message.push({
        attribute: 'conf_senha',
        problem: 'As senhas devem ser iguais!'
      });
    } else if (camposUsuario.nova_senha.length < 8) {
      message.push({
        attribute: 'nova_senha',
        problem: 'A nova senha deve conter no mínimo 8 caracteres!'
      });
    }
    return message;
  }

});
Bookshelf.model('Usuario', Usuario);

module.exports = Usuario;
