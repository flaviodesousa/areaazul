'use strict';

const _ = require('lodash');
const bcrypt = require('bcrypt-then');
const validator = require('validator');

const log = require('../../logging');
const AreaAzul = require('../../areaazul');
const AreaAzulMailer = require('areaazul-mailer');
const Bookshelf = require('../../database');

const PessoaFisica = Bookshelf.model('PessoaFisica');
const Conta = Bookshelf.model('Conta');

const Usuario = Bookshelf.Model.extend({
  tableName: 'usuario',
  pessoaFisica: function() {
    return this.hasOne('PessoaFisica', 'id');
  },
  veiculos: function() {
    return this.hasMany('Veiculo')
      .through('UsuarioHasVeiculo');
  },
  conta: function() {
    return this.belongsTo('Conta', 'conta_id');
  },
  ativacoes: function() {
    return this.hasMany('Ativacao').through('AtivacaoUsuario');
  }
}, {
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
              return PessoaFisica._alterar(
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
      })
      .then(usuario => Usuario._buscarPorId(usuario.id, options));
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

  _camposValidos: function(camposUsuario, usuario, options) {
    var messages = Usuario._loginValido(camposUsuario);
    messages.push.apply(messages,
      Usuario._senhaValida(camposUsuario, usuario));

    return PessoaFisica
      ._camposValidos(camposUsuario, options)
      .then(function(messagesPessoaFisica) {
        messages.push.apply(messages, messagesPessoaFisica);
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
  },
  _buscarPorId: function(id, options) {
    return new Usuario({ id: id })
      .fetch(_.merge({
        require: true,
        withRelated: [ 'pessoaFisica', 'pessoaFisica.pessoa', 'conta' ]
      }, options))
      .catch(Bookshelf.NotFoundError, () => {
        const err = new AreaAzul.BusinessException(
          'Usuário revendedor: id não encontrado',
          { id: id });
        log.warn(err.message, err.details);
        throw err;
      });
  },
  _listaAtivacoes: (id, antesDe = new Date(), limite = 100, options = null) =>
    Bookshelf.model('Ativacao')
      ._lista(id, antesDe, limite, 'usuario', options)
  ,
  _listaVeiculos: (id, antesDe = new Date(), limite = 10, options) =>
    Usuario
      .query(qb => {
        qb
          .innerJoin('usuario_has_veiculo', 'usuario_id', 'usuario.id')
          .innerJoin('veiculo', 'veiculo_id', 'veiculo.id')
          .where('ultima_ativacao', '<', antesDe)
          .where('usuario.id', id)
          .orderBy('ultima_ativacao', 'desc')
          .limit(limite)
          .select('veiculo.*')
          .select('ultima_ativacao');
      })
      .fetchAll(options),
  _extratoFinanceiro: (id, antesDe = new Date(), limite = 10, options) =>
    Usuario
      .query(qb => {
        qb
          .innerJoin('movimentacao_conta', 'usuario.conta_id', 'movimentacao_conta.conta_id')
          .where('usuario.id', id)
          .where('data', '<', antesDe)
          .orderBy('data', 'desc')
          .limit(limite)
          .select('movimentacao_conta.*');
      })
      .fetchAll(options)
});
Bookshelf.model('Usuario', Usuario);

module.exports = Usuario;
