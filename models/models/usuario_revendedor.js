'use strict';

var bcrypt = require('bcrypt-then');
var validator = require('validator');
var _ = require('lodash');

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const log = AreaAzul.log;
const validation = require('./validation');

const PessoaFisica = Bookshelf.model('PessoaFisica');

var UsuarioRevendedor = Bookshelf.Model.extend({
  tableName: 'usuario_revendedor',
  pessoaFisica: function() {
    return this.belongsTo('PessoaFisica');
  },
  revendedor: function() {
    return this.belongsTo('Revendedor');
  }
}, {
  autorizado: function(login, senha) {
    var usuarioRevendedor;
    return new UsuarioRevendedor({ login: login })
      .fetch({
        require: true,
        withRelated: [
          'revendedor', 'pessoaFisica', 'pessoaFisica.pessoa' ] })
      .catch(Bookshelf.NotFoundError, () => {
        const err = new AreaAzul.AuthenticationError(
          'Usuário revendedor: login inválido', {
            login: login
          });
        log.warn(err.message, err.details);
        throw err;
      })
      .then(function(ur) {
        usuarioRevendedor = ur;
        return bcrypt.compare(senha, ur.get('senha'));
      })
      .then(function(valid) {
        if (valid) {
          return usuarioRevendedor;
        }
        const err = new AreaAzul.AuthenticationError(
          'Usuário revendedor: senha incorreta', {
            login: login,
            usuario: usuarioRevendedor
          });
        log.warn(err.message, err.details);
        throw err;
      });
  },

  _salvarUsuarioRevenda: function(campos, usuarioRevendedor, options) {
    var UsuarioRevendedor = this;
    var senha;

    return UsuarioRevendedor
      ._validarUsuarioRevenda(campos, options.method, options)
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
        return bcrypt.hash(campos.nova_senha);
      })
      .then(function(hash) {
        senha = hash;
        return new PessoaFisica({ cpf: campos.cpf })
          .fetch(options);
      })
      .then(function(pessoaFisica) {
        if (pessoaFisica !== null) {
          return PessoaFisica.alterar(campos, pessoaFisica.id, options);
        }
        // Caso nao exista, criar a pessoa fisica
        return PessoaFisica._cadastrar(campos, options);
      })
      .then(function(pessoaFisica) {
        var dadosUsuarioRevendedor = {
          login: campos.login,
          senha: senha,
          autorizacao: campos.autorizacao,
          acesso_confirmado: false,
          ativo: true,
          revendedor_id: campos.revendedor_id,
          pessoa_fisica_id: pessoaFisica.id
        };

        if (usuarioRevendedor) {
          return usuarioRevendedor
            .save(
              dadosUsuarioRevendedor,
              _.merge({ method: 'update', patch: true }, options));
        }
        return new UsuarioRevendedor(dadosUsuarioRevendedor)
          .save(null, _.merge({ method: 'insert' }, options));
      });
  },

  _inserir: function(camposUsuarioRevendedor, options) {
    return UsuarioRevendedor._salvarUsuarioRevenda(
      camposUsuarioRevendedor, null, options);
  },

  inserir: function(entidade) {
    return Bookshelf.transaction(function(t) {
      return UsuarioRevendedor._salvarUsuarioRevenda(
        entidade, null, { transacting: t });
    });
  },

  _alterar: function(camposUsuarioRevendedor, usuarioRevendedor, options) {
    return UsuarioRevendedor
      ._salvarUsuarioRevenda(
        camposUsuarioRevendedor, usuarioRevendedor, options);
  },

  alterar: function(entidade) {
    return Bookshelf.transaction(function(t) {
      const options = { transacting: t };
      return new UsuarioRevendedor({
        revendedor_id: entidade.revendedor_id, login: entidade.login
      })
        .fetch(options)
        .then(function(usuarioRevendedor) {
          return UsuarioRevendedor
            ._salvarUsuarioRevenda(entidade, usuarioRevendedor, options);
        });
    });
  },

  _alterarSenha: function(camposTrocaSenha, options) {
    var usuarioRevendedor;
    new UsuarioRevendedor({ id: camposTrocaSenha.id })
      .fetch()
      .then(function(model) {
        usuarioRevendedor = model;
        return bcrypt.compare(
          camposTrocaSenha.nova_senha, usuarioRevendedor.get('senha'));
      })
      .then(function(valid) {
        if (!valid) {
          throw new AreaAzul.AuthenticationError(
            'Senha atual incorreta. Senha não alterada',
            {});
        }
        return bcrypt.hash(camposTrocaSenha.nova_senha);
      })
      .then(function(hashNovaSenha) {
        return usuarioRevendedor
          .save(
            { senha: hashNovaSenha },
            _.merge({ method: 'update', patch: true }, options));
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
            'Desativação de usuário revendedor: Usuário não encontrado',
            { id: id });
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
        problem: 'Nova senha é obrigatória!'
      });
    }
    if (user.senha === null || user.senha === '') {
      message.push({
        attribute: 'senha',
        problem: 'Senha é obrigatória!'
      });
    }
    if (user.conf_senha === null || user.conf_senha === '') {
      message.push({
        attribute: 'conf_senha',
        problem: 'Confirmação de senha é obrigatória!'
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
        problem: 'A senha deve conter no mínimo 8 caracteres!'
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

    if (user.senha.length < 8) {
      message.push({
        attribute: 'senha',
        problem: 'A senha deve conter no mínimo 8 caracteres!'
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
    var usuarioRevendedor;
    return new UsuarioRevendedor({ id: user.id })
      .fetch({ require: true })
      .catch(Bookshelf.NotFoundError, () => {
        throw new AreaAzul.BusinessException(
          'Usuário não encontrado!', { user: user });
      })
      .then(function(ur) {
        usuarioRevendedor = ur;
        return bcrypt.hash(user.senha);
      })
      .then(function(hash) {
        return usuarioRevendedor.save({
          primeiro_acesso: 'false',
          senha: hash
        });
      });
  },

  buscarPorId: function(id) {
    return new UsuarioRevendedor({ id: id })
      .fetch({ require: true })
      .catch(Bookshelf.NotFoundError, () => {
        const err = new AreaAzul.BusinessException(
          'Usuário revendedor: id não encontrado', {
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
