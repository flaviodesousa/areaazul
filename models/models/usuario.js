'use strict';

var _ = require('lodash');
var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa');
var PessoaFisica = require('./pessoafisica').PessoaFisica;
var UsuarioCollection = require('../collections/usuario');
var bcrypt = require('bcrypt');
var validator = require('validator');
var validation = require('./validation');
var util = require('../../helpers/util');
var Conta = require('./conta');
var UsuarioHasVeiculo = require('./usuario_has_veiculo');
var Veiculo = require('./veiculo').Veiculo;

var Usuario = Bookshelf.Model.extend({
  tableName: 'usuario',
  idAttribute: 'pessoa_id',
  pessoaFisica: function() {
    return this.hasOne(PessoaFisica, 'pessoa_id');
  },
  veiculos: function() {
    return this.hasMany(Veiculo)
      .through(UsuarioHasVeiculo);
  },
}, {
  autorizado: function(login, senha) {
    var Usuario = this;
    var err;
    return Usuario
      .forge({login: login})
      .fetch()
      .then(function(usuario) {
        if (usuario === null) {
          err = new Error('login invalido: ' + login);
          err.authentication_event = true;
          throw err;
        }
        if (util.senhaValida(senha, usuario.get('senha'))) {
          return usuario;
        } else {
          err = new Error('senha incorreta');
          err.authentication_event = true;
          throw err;
        }
      });
  },
  cadastrar: function(user) {
    var Usuario = this;
    var usuario;
    var login;
    var senha;
    var senhaGerada;

    if (!user.senha) {
      senhaGerada = util.generate();
      senha = util.criptografa(senhaGerada);
    } else {
      senha = util.criptografa(user.senha);
    }

    if (!user.login) {
      login = user.cpf;
    } else {
      login = user.login;
    }

    return Bookshelf.transaction(function(t) {
      var options = { transacting: t };
      var optionsInsert = _.merge({}, options, { method: 'insert' });
      return PessoaFisica
        ._cadastrar(user, options)
        .then(function(pf) {
          return Usuario
            .forge({
              pessoa_id: pf.id,
              login: login,
              senha: senha,
              primeiro_acesso: true,
              ativo: true,
            })
            .save(null, optionsInsert)
            .then(function(u) {
              // Salvar usuario para que seja o resultado
              // final do metodo.
              usuario = u;
              return u;
            });
        })
        .then(function(user) {
          return Conta
            .forge({
              data_abertura: new Date(),
              saldo: 0,
              ativo: true,
              pessoa_id: user.id,
            })
            .save(null, options);
        });
    })
    .then(function() {
      return util.enviarEmailConfirmacao(user, login, senhaGerada);
    })
    .then(function() {
      return usuario;
    });
  },
});



module.exports = Usuario;

var UsuarioCollection =  Bookshelf.Collection.extend({
  model: Usuario,
});


exports.search = function(entidade, func) {
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
};

exports.listar = function(then, fail) {
  UsuarioCollection.forge().query(function(qb) {
    qb.join('pessoa',
      'pessoa.id_pessoa', 'usuario.pessoa_id');
    qb.join('pessoa_fisica',
      'pessoa_fisica.pessoa_id', 'pessoa.id_pessoa');
    qb.where('usuario.ativo', '=', 'true');
    qb.select('usuario.*');
    qb.select('pessoa.*');
    qb.select('pessoa_fisica.*');
  }).fetch().then(function(collection) {
    then(collection);
  }).catch(function(err) {
    fail(err);
  });
};

exports.alterarSenha = function(user, then, fail) {
  new this({
      id_usuario: user.id_usuario,
    })
      .fetch()
      .then(function(model) {
        var pwd;
        if (model !== null) {
          pwd = model.attributes.senha;
        }
        var hash = bcrypt.compareSync(user.senha, pwd);
        console.log('hash' + hash);
        if (hash !== false) {
          var novaSenha = util.criptografa(user.nova_senha);

          model.save({
            primeiro_acesso: 'false',
            senha: novaSenha,
            ativo: 'true',
          }).then(function(model) {
            util.log('Alterado com sucesso!');
            then(model);
          }).catch(function(err) {
            util.log('Houve erro ao alterar');
            util.log('Model: ' + model.attributes);
            fail(model.attributes);
            fail(err);
          });
        } else {
          fail();
        }
      })
      .catch(function(err) {
        fail(err);
      });
};


exports.procurar = function(user, then, fail) {
  Usuario.forge().query(function(qb) {
    qb.join('pessoa',
      'pessoa.id_pessoa', '=', 'usuario.pessoa_id');
    qb.join('pessoa_fisica',
      'pessoa_fisica.pessoa_id', '=', 'pessoa.id_pessoa');
    qb.join('conta',
      'pessoa.id_pessoa', '=', 'conta.pessoa_id');
    qb.where('usuario.id_usuario', user.id_usuario);
    qb.select('usuario.*', 'pessoa.*', 'pessoa_fisica.*', 'conta.*');
  }).fetch().then(function(model) {
    then(model);
  }).catch(function(err) {
    fail(err);
  });
};


exports.validate = function(user) {
  var message = [];

  if (validator.isNull(user.nome)) {
    message.push({
      attribute: 'nome',
      problem: 'Nome obrigatório',
    });
  }

  if (validator.isNull(user.sexo)) {
    message.push({
      attribute: 'sexo',
      problem: 'Sexo obrigatório',
    });
  }

  if (validator.isNull(user.cpf)) {
    message.push({
      attribute: 'cpf',
      problem: 'CPF é obrigatório',
    });
  }

  if (validator.isNull(user.email)) {
    message.push({
      attribute: 'email',
      problem: 'Email obrigatório!',
    });
  }

  if (!validator.isEmail(user.email)) {
    message.push({
      attribute: 'email' ,
      problem: 'Email inválido!',
    });
  }

  if (!validation.isCPF(user.cpf)) {
    message.push({
      attribute: 'cpf',
      problem: 'CPF inválido!',
    });
  }

  if (user.data_nascimento === '') {
    message.push({
      attribute: 'data_nascimento',
      problem: 'Data de nascimento é obrigatório!',
    });
  }

  return message;
};

exports.validateNomeUsuario = function(user) {
  var message = [];
  if (validator.isNull(user.login) || user.login === '') {
    message.push({
      attribute: 'nova_senha',
      problem: 'Login é obrigatório!',
    });
  }
  if ((user.login.length < 4) || (user.login.length > 32)) {
    message.push({
      attribute: 'login',
      problem: 'O nome de login deve conter de 4 a 32 caracteres',
    });
  }
  return message;
};


exports.validarSenha = function(user) {
  var message = [];
  if (validator.isNull(user.nova_senha)) {
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
  if (validator.isNull(user.conf_senha)) {
    message.push({
      attribute: 'conf_senha',
      problem: 'Confirmação de senha é obrigatória!',
    });
  }
  if (user.nova_senha !== user.conf_senha) {
    message.push({
      attribute: 'conf_senha',
      problem: 'As senhas devem ser iguais!',
    });
  }
  if (user.senha.length < 4) {
    message.push({
      attribute: 'senha',
      problem: 'A senha deve conter no minimo 4 caracteres!',
    });
  }
  if (user.conf_senha.length < 4 && user.conf_senha.length > 8) {
    message.push({
      attribute: 'conf_senha',
      problem: 'A confirmação de senha deve conter no minimo 4 caracteres!',
    });
  }
  if (user.nova_senha.length < 4) {
    message.push({
      attribute: 'nova_senha',
      problem: 'A nova senha deve conter no minimo 4 caracteres!',
    });
  }

  return message;
};
