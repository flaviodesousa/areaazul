'use strict';

var _ = require('lodash');
var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa');
var PessoaFisica = require('./pessoafisica').PessoaFisica;
var UsuarioRevendedor = require('./usuario_revendedor');
var Usuario = require('./usuario');
var UsuarioCollection = require('../collections/usuario');
var PessoaJuridica = require('./pessoajuridica');
var PessoaJuridicaCollection = require('../collections/pessoajuridica');
var PessoaCollection = require('../collections/pessoa');
var RevendedorCollection = require('../collections/revendedor');
var PessoaFisicaCollection = require('../collections/pessoafisica');
var Areaazul_mailer = require('areaazul-mailer');
var validation = require('./validation');
var util = require('./util');
var validator = require("validator");
var Conta = require('./conta');
var AreaAzul = require('../../areaazul.js');
var log = AreaAzul.log;
var BusinessException = AreaAzul.BusinessException;


var Revendedor = Bookshelf.Model.extend({
  tableName: 'revendedor',
  idAttribute: 'pessoa_id',
},
{
  cadastrar: function(dealer) {
    return Bookshelf.transaction(function(t) {
      var options = { transacting: t };
      var optionsInsert = _.merge({}, options, {method: 'insert'});
      var idPessoa = null;
      var idRevendedor = null;
      var senha;
      var arrValidate;
      var senha = util.criptografa(dealer.senha);
      var err;

      if (!dealer.cnpj) {
        var arrValidate = Revendedor.validateRevendedorPessoaFisica(dealer);
        if (arrValidate.length == 0) {
          return PessoaFisica
            ._cadastrar(dealer, options)
            .then(function(pf) {
              idPessoa = pf.id;
              return Revendedor._cadastrar(pf, options)
            .then(function(revenda) {
              idRevendedor = revenda.get('pessoa_id');
              return UsuarioRevendedor
              .forge({
                   login: dealer.login,
                   senha: senha,
                   acesso_confirmado: true,
                   ativo: true,
                   autorizacao: dealer.autorizacao,
                   revendedor_id:  idRevendedor,
                   pessoa_fisica_pessoa_id: idPessoa,
                 }).save(null, optionsInsert);
            })
              .then(function(usuario_revenda) {
                return usuario_revenda;
              });
            });

        }else {
          err = new AreaAzul.BusinessException('Nao foi possivel cadastrar nova Revenda. Dados invalidos', 
          {validationFailures: arrValidate});
          throw err;
        }

      }else {  
        var arrValidate = Revendedor.validateRevendedorPessoaJuridica(dealer);
        if (arrValidate.length == 0) {
          return PessoaJuridica
              ._cadastrar(dealer, options)
            .then(function(pj) {
              idPessoa = pj.id;
              return Revendedor._cadastrar(pj, options);
            })
            .then(function(revenda_pj) {
              return PessoaFisica
                ._cadastrar(dealer, options)
                  .then(function(pf) {
                    idPessoa = pf.id;
                    return Revendedor._cadastrar(pf, options)
                  .then(function(revenda) {
                    idRevendedor = revenda.get('pessoa_id');
                    return UsuarioRevendedor
                    .forge({
                      login: dealer.login,
                      senha: senha,
                      acesso_confirmado: true,
                      ativo: true,
                      autorizacao: dealer.autorizacao,
                      revendedor_id:  idRevendedor,
                      pessoa_fisica_pessoa_id: idPessoa,
                    }).save(null, optionsInsert);
                  })
                  .then(function(usuario_revenda) {
                    return usuario_revenda;
                  });
                  });
            });  
        }else {
          err = new AreaAzul.BusinessException('Nao foi possivel cadastrar nova Revenda. Dados invalidos', 
          {validationFailures: arrValidate});
          throw err;
        }
      }
    });
  },
  _cadastrar: function(pessoa, options) {
    var optionsInsert = _.merge({}, options || {}, {method: 'insert'});
    return Revendedor
      .forge({
        ativo: true,
        pessoa_id: pessoa.id,
      })
      .save(null, optionsInsert)
      .then(function(revenda) {
        return Conta
          .forge({
            data_abertura: new Date(),
            saldo: 0,
            ativo: true,
            pessoa_id: pessoa.id,
          })
          .save(null, options);
      });
  },

  validateRevendedorPessoaFisica: function(dealer) {
  var message = [];
  if (!dealer.nome) {
    message.push({
        attribute: 'nome',
        problem: 'Nome obrigatório!',
      });
  }

  if (!dealer.telefone) {
    message.push({
        attribute: 'telefone',
        problem: 'Telefone obrigatório!',
      });
  }

  if (!dealer.cpf) {
    message.push({
        attribute: 'cpf',
        problem: 'CPF é obrigatório!',
      });
  }

  if (!dealer.email) {
    message.push({
        attribute: 'email',
        problem: 'Email obrigatório!',
      });
  }

  if (!dealer.login) {
    message.push({
        attribute: 'login',
        problem: 'Login obrigatório!',
      });
  }
  return message;
},

validateRevendedorPessoaJuridica: function(dealer) {
  var message = [];

    if (!dealer.cnpj) {
    message.push({
        attribute: 'cnpj',
        problem: 'Nome obrigatório!',
      });
  }

    if (!dealer.nome_fantasia) {
    message.push({
        attribute: 'nome_fantasia',
        problem: 'Nome fantasia obrigatório!',
      });
  }

    if (!dealer.razao_social) {
    message.push({
        attribute: 'razao_social',
        problem: 'Razao social obrigatório!',
      });
  }

  if (!dealer.nome) {
    message.push({
        attribute: 'nome',
        problem: 'Nome obrigatório!',
      });
  }

  if (!dealer.telefone) {
    message.push({
        attribute: 'telefone',
        problem: 'Telefone obrigatório!',
      });
  }

  if (!dealer.cpf) {
    message.push({
        attribute: 'cpf',
        problem: 'CPF é obrigatório!',
      });
  }

  if (!dealer.email) {
    message.push({
        attribute: 'email',
        problem: 'Email obrigatório!',
      });
  }

  if (!dealer.login) {
    message.push({
        attribute: 'login',
        problem: 'Login obrigatório!',
      });
  }

  if (!dealer.senha) {
    message.push({
        attribute: 'login',
        problem: 'Senha e confirmacao de senha devem ser iguais!',
      });
  }
  return message;
},




  buscarRevendedor: function(user, then, fail) {
  Revendedor
  .forge()
  .query(
    function(qb) {
      qb.join('pessoa', 'pessoa.id_pessoa', '=', 'revendedor.pessoa_id');
      qb.join('usuario_revendedor', 'usuario_revendedor.revendedor_id', '=', 'revendedor.pessoa_id');
      qb.join('conta', 'conta.pessoa_id', '=', 'pessoa.id_pessoa');
      qb.where('usuario_revendedor.pessoa_fisica_pessoa_id', user.pessoa_id);
      qb.select('revendedor.*', 'usuario_revendedor.*', 'pessoa.*', 'conta.*');
    })
    .fetch()
  .then(function(model) {
    then(model);
  }).catch(function(err) {
    fail(err);
  });
}



});

module.exports = Revendedor;

var RevendedorCollection =  Bookshelf.Collection.extend({
  model: Revendedor
});


exports.getById = function(id, func) {
  util.log('getById');
  new Revendedor({
    id_revendedor: id
  }).fetch().then(function(model, err) {
    if (model != null)
        var retorno = model.attributes;
    if (err) {
      return func(null);
    }
    func(retorno);
  });
}


exports.listarpj = function(func) {
  RevendedorCollection.forge().query(function(qb) {
    qb.join('pessoa', 'pessoa.id_pessoa', '=', 'revendedor.pessoa_id');
    qb.join('usuario', 'usuario.pessoa_id', '=', 'pessoa.id_pessoa');
    qb.join('pessoa_juridica', 'pessoa_juridica.pessoa_id', '=', 'pessoa.id_pessoa');
    qb.where('revendedor.ativo', '=', 'true');
    qb.select('usuario.*', 'pessoa.*', 'pessoa_juridica.*', 'revendedor.*');
  }).fetch().then(function(collection) {
    util.log(collection.models);
    then(collection);
  }).catch(function(err) {
    fail(err);
  });
}

exports.listarpf = function(then, fail) {
  RevendedorCollection.forge().query(function(qb) {
    qb.join('pessoa', 'pessoa.id_pessoa', '=', 'revendedor.pessoa_id');
    qb.join('usuario', 'usuario.pessoa_id', '=', 'pessoa.id_pessoa');
    qb.join('pessoa_fisica', 'pessoa_fisica.pessoa_id', '=', 'pessoa.id_pessoa');
    qb.where('revendedor.ativo', '=', 'true');
    qb.select('usuario.*', 'pessoa.*', 'pessoa_fisica.*', 'revendedor.*');
  }).fetch().then(function(collection) {
    then(collection);
  }).catch(function(err) {
    fail(err);
  });
}

exports.procurarpf = function(dealer, then, fail) {
  Revendedor.forge().query(function(qb) {
    qb.join('pessoa', 'pessoa.id_pessoa', '=', 'revendedor.pessoa_id');
    qb.join('usuario', 'usuario.pessoa_id', '=', 'pessoa.id_pessoa');
    qb.join('pessoa_fisica', 'pessoa_fisica.pessoa_id', '=', 'pessoa.id_pessoa');
    qb.join('conta', 'pessoa.id_pessoa', '=', 'conta.pessoa_id');
    qb.where('revendedor.id_revendedor', dealer.id_revendedor);
    qb.select('revendedor.*', 'usuario.*', 'pessoa.*', 'pessoa_fisica.*', 'conta.*');
  }).fetch().then(function(model) {
    then(model);
  }).catch(function(err) {
    fail(err);
  });
}

exports.procurarpj = function(dealer, then, fail) {
  Revendedor.forge().query(function(qb) {
    qb.join('pessoa', 'pessoa.id_pessoa', '=', 'revendedor.pessoa_id');
    qb.join('usuario', 'usuario.pessoa_id', '=', 'pessoa.id_pessoa');
    qb.join('pessoa_juridica', 'pessoa_juridica.pessoa_id', '=', 'pessoa.id_pessoa');
    qb.join('conta', 'pessoa.id_pessoa', '=', 'conta.pessoa_id');
    qb.where('revendedor.id_revendedor', dealer.id_revendedor);
    qb.select('revendedor.*', 'usuario.*', 'pessoa.*', 'pessoa_juridica.*', 'conta.*');
  }).fetch().then(function(model) {
    then(model);
  }).catch(function(err) {
    fail(err);
  });
}

exports.procurar = function(dealer, then, fail) {
  Revendedor.forge().query(function(qb) {
    qb.join('pessoa', 'pessoa.id_pessoa', '=', 'revendedor.pessoa_id');
    qb.join('usuario', 'usuario.pessoa_id', '=', 'pessoa.id_pessoa');
    qb.join('pessoa_juridica', 'pessoa_juridica.pessoa_id', '=', 'pessoa.id_pessoa');
    qb.join('pessoa_juridica', 'pessoa_juridica.pessoa_id', '=', 'pessoa.id_pessoa');
    qb.where('revendedor.id_revendedor', dealer.id_revendedor);
    qb.select('revendedor.*', 'usuario.*', 'pessoa.*', 'pessoa_juridica.*');
  }).fetch().then(function(model) {
    then(model);
  }).catch(function(err) {
    fail(err);
  });
}

exports.mostrarSaldo = function(user, then, fail) {
  console.log("usuario" + user.id_usuario);
  Revendedor.forge().query(function(qb) {
    qb.join('pessoa', 'pessoa.id_pessoa', '=', 'revendedor.pessoa_id');
    qb.join('usuario', 'usuario.pessoa_id', '=', 'pessoa.id_pessoa');
    qb.join('conta', 'conta.pessoa_id', '=', 'pessoa.id_pessoa');
    qb.where('usuario.id_usuario', user.id_usuario);
    qb.select('revendedor.*', 'usuario.*', 'pessoa.*', 'conta.*');
    console.log("sql: " + qb);
  }).fetch().then(function(model) {
    console.log("model" + model);
    then(model);
  }).catch(function(err) {
    console.log("err" + err);
    fail(err);
  });
}

module.exports = Revendedor;
