'use strict';

var _ = require('lodash');
var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa');
var PessoaFisica = require('./pessoafisica');
var UsuarioCollection = require('../collections/usuario');
var bcrypt = require('bcrypt');
var validator = require('validator');
var validation = require('./validation');
var util = require('./util');
var Conta = require('./conta');

var Usuario = Bookshelf.Model.extend({
  tableName: 'usuario',
  idAttribute: 'id_usuario',
  pessoaFisica: function() {
    return this.hasOne(PessoaFisica);
  },
}, {
  cadastrar: function(user) {
    var Usuario = this;
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
      var optionsInsert = _.merge(options, { method: 'insert' });
      user = _.merge(user, { ativo: true });
      return PessoaFisica
        ._cadastrar(user, options)
        .then(function(pf) {
          user = _.merge(user, {
            pessoa_id: pf.get('pessoa_id'),
            login: login,
            primeiro_acesso: true,
          });
          return Usuario
            .forge(user)
            .save(null, optionsInsert);
        })
        .then(function() {
          return Conta
            .forge({
              data_abertura: new Date(),
              saldo: 0,
              ativo: true,
              pessoa_id: user.pessoa_id,
            })
            .save(null, options);
        });
    })
    .then(function() {
      return util.enviarEmailConfirmacao(user, login, senhaGerada);
    });
  },
});

exports.Usuario = Usuario;

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
    qb.join('pessoa', 'pessoa.id_pessoa', '=', 'usuario.pessoa_id');
    qb.join('pessoa_fisica', 'pessoa_fisica.pessoa_id', '=', 'pessoa.id_pessoa');
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

exports.editar = function(user, then, fail) {
  var dataDeNascimento = util.converteData(user.data_nascimento);

  var usuario = new this.Usuario({
    id_usuario: user.id_usuario,
    login: user.cpf,
    primeiro_acesso: true,
    ativo: true,
  });
  var pessoa = new Pessoa.Pessoa({
    id_pessoa: user.pessoa_id,
    nome: user.nome,
    email: user.email,
    telefone: user.telefone,
    ativo: true,
  });
  var pessoaFisica = new PessoaFisica.PessoaFisica({
    id_pessoa_fisica: user.id_pessoa_fisica,
    cpf: user.cpf,
    data_nascimento: dataDeNascimento,
    sexo: user.sexo,
    ativo: true,
  });

  Pessoa.updateTransaction(pessoa, usuario, pessoaFisica,
  function(model) {
    then(model);
  }, function(err) {
    fail(err);
  });
};


exports.procurar = function(user, then, fail) {
  Usuario.forge().query(function(qb) {
    qb.join('pessoa', 'pessoa.id_pessoa', '=', 'usuario.pessoa_id');
    qb.join('pessoa_fisica', 'pessoa_fisica.pessoa_id', '=', 'pessoa.id_pessoa');
    qb.join('conta', 'pessoa.id_pessoa', '=', 'conta.pessoa_id');
    qb.where('usuario.id_usuario', user.id_usuario);
    qb.select('usuario.*', 'pessoa.*', 'pessoa_fisica.*', 'conta.*');
  }).fetch().then(function(model) {
    then(model);
  }).catch(function(err) {
    fail(err);
  });
};

exports.desativar = function(user, then, fail) {
  this.procurar({id_usuario: user.id_usuario},
    function(result) {
    var pessoa = new Pessoa.Pessoa({
      id_pessoa: result.attributes.pessoa_id,
      ativo: false,
    });
    var pessoaFisica = new PessoaFisica.PessoaFisica({
      id_pessoa_fisica: result.attributes.id_pessoa_fisica,
      ativo: false,
    });
    var usuario = new Usuario({
      id_usuario: result.attributes.id_usuario,
      ativo: false,
    });
    var conta = new Conta.Conta({
      id_conta: result.attributes.id_conta,
      data_fechamento: new Date(),
      ativo: false,
    });

    Pessoa.updateTransaction(pessoa, usuario, conta, pessoaFisica,
    function(model) {
      then(model);
    }, function(err) {
      fail(err);
    });

  });
};


exports.validate = function(user) {
  var message = [];
  if (validator.isNull(user.nome)) {
    message.push({attribute: 'nome', problem: 'Nome obrigatório'});
  }
  if (validator.isNull(user.sexo)) {
    message.push({attribute: 'sexo', problem: 'Sexo obrigatório'});
  }
  if (validator.isNull(user.cpf)) {
    message.push({attribute: 'cpf', problem: 'CPF é obrigatório'});
  }
  if (validator.isNull(user.email)) {
    message.push({attribute: 'email', problem: 'Email obrigatório!'});
  }
  if (!validator.isEmail(user.email)) {
    message.push({attribute: 'email' , problem: 'Email inválido!'});
  }
  if (!validation.isCPF(user.cpf)) {
    message.push({attribute: 'cpf', problem: 'CPF inválido!'});
  }
  if (user.data_nascimento === '') {
    message.push({attribute: 'data_nascimento', problem: 'Data de nascimento é obrigatório!'});
  }

  for (var i = 0; i < message.length;i++) {
    console.log('Atributo: ' + message[i].attribute + ' Problem: ' + message[i].problem);
  }
  return message;
};

exports.validateNomeUsuario = function(user) {
  var message = [];
  if (validator.isNull(user.login) || user.login === '') {
    message.push({attribute: 'nova_senha', problem: 'Login é obrigatório!'});
  }
  if ((user.login.length > 4) && (user.login.length < 8)) {
    message.push({attribute: 'login', problem: 'O nome de login deve conter no minimo 4 a 8 caracteres'});
  }
  return message;
};


exports.validarSenha = function(user) {
  var message = [];
  if (validator.isNull(user.nova_senha)) {
    message.push({attribute: 'nova_senha', problem: 'Nova senha é obrigatório!'});
  }
  if (validator.isNull(user.senha)) {
    message.push({attribute: 'senha', problem: 'Senha é obrigatório!'});
  }
  if (validator.isNull(user.conf_senha)) {
    message.push({attribute: 'conf_senha', problem: 'Confirmação de senha é obrigatório!'});
  }
  if (validator.isNull(user.nova_senha)) {
    message.push({attribute: 'nova_senha', problem: 'As senhas devem ser iguais!'});
  }
  if (user.senha.length < 4 && user.senha.length > 8) {
    message.push({attribute: 'senha', problem: 'A senha deve conter no minimo 4 a 8 caracteres!'});
  }
  if (user.conf_senha.length < 4 && user.conf_senha.length > 8) {
    message.push({attribute: 'conf_senha', problem: 'A confirmação de senha deve conter no minimo 4 a 8caracteres!'});
  }
  if (user.nova_senha.length < 4 && user.nova_senha.length  > 8) {
    message.push({attribute: 'nova_senha', problem: 'A nova senha deve conter no minimo 4 a 8 caracteres!'});
  }

  for (var i = 0; i < message.length;i++) {
    console.log('Atributo: ' + message[i].attribute + ' Problem: ' + message[i].problem);
  }

  return message;
};
