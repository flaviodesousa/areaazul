var _ = require('lodash');
var Promise = require('bluebird');
var bcrypt = require('bcrypt');
var Areaazul_mailer = require('areaazul-mailer');
var moment = require('moment');
var util = require('./util');

var app = require('../../areaazul');
var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa').Pessoa;
var PessoaFisica = require('./pessoafisica').PessoaFisica;

var UsuarioFiscal = Bookshelf.Model.extend({
  tableName: 'usuario_fiscal',
  idAttribute: 'pessoa_id',
  validateFiscal: function (tax) {

    var pessoa = new Pessoa({
      'nome': tax.nome,
      'email': tax.email,
      'telefone': tax.telefone,
      'ativo': 'true'
    });
    var pessoaFisica = new PessoaFisica({
      'cpf': tax.cpf,
      'data_nascimento': tax.data_nascimento,
      'sexo': tax.sexo,
      'ativo': 'true'
    });

    if (!PessoaFisica.validate(pessoaFisica)) {
      return false;
    }

    if (!Pessoa.validate(pessoa)) {
      return false;
    }

    return true;

  },
  desativar: function (tax, then, fail) {
    util.log('Tax: ' + tax);
    var pessoa = new Pessoa.Pessoa({
      id_pessoa: tax.pessoa_id,
      ativo: false
    });
    var pessoaFisica = new PessoaFisica.PessoaFisica({
      id_pessoa_fisica: tax.id_pessoa_fisica,
      ativo: false
    });
    var usuario_fiscal = new UsuarioFiscal({
      pessoa_id: tax.pessoa_id,
      ativo: false
    });

    Pessoa.sixUpdateTransaction(pessoa, usuario_fiscal, pessoaFisica,
      function (model) {
        then(model);
      }, function (err) {
        fail(err);
      });
  }

}, {
  cadastrar: function (tax, then, fail) {
    var Fiscal = this;
    var fiscal = null;

    var senha;
    if (!tax.senha) {
      senha = util.criptografa(util.generate());
    } else {
      senha = util.criptografa(tax.senha);
    }

    Bookshelf.transaction(function (t) {
      var trx = {transacting: t};
      var trx_ins = _.merge(trx, {method: 'insert'});
      // verifica se a pessoa fisica ja' existe
      PessoaFisica
        .forge({cpf: tax.cpf})
        .fetch()
        .then(function (pessoa_fisica) {
          // se pessoa fisica ja' existir, conectar a ela
          if (pessoa_fisica !== null) {
            return pessoa_fisica;
          }
          // caso nao exista, criar a pessoa fisica
          return new Pessoa({
            nome: tax.nome,
            email: tax.email,
            telefone: tax.telefone,
            ativo: true
          })
            .save(null, trx)
            .then(function (pessoa) {
              return new PessoaFisica({
                cpf: tax.cpf,
                data_nascimento: tax.data_nascimento,
                sexo: tax.sexo,
                ativo: true,
                pessoa_id: pessoa.get('id_pessoa')
              })
                .save(null, trx_ins);
            });
        })
        .then(function (pessoa_fisica) {
          return new Fiscal({
            login: tax.login,
            senha: senha,
            primeiro_acesso: true,
            ativo: true,
            pessoa_id: pessoa_fisica.get('pessoa_id')
          })
            .save(null, trx_ins);
        })
        .then(function (f) {
          fiscal = f;
          trx.transacting.commit();
          return fiscal;
        })
        .catch(function (err) {
          trx.transacting.rollback();
          throw err;
        });
    })
      .then(
        function () {
          then(fiscal);
        },
        function (e) {
          fail(e);
        }
      );
  },
  valido: function (login, senha) {
    var UsuarioFiscal = this;
    return UsuarioFiscal
      .forge({login: login})
      .fetch()
      .then(function(usuario_fiscal) {
        if (usuario_fiscal === null) {
          var err = new Error("login invalido: " + login);
          err.authentication_event = true;
          throw err;
        }
        var hash_senha = util.criptografa(senha);
        if (hash_senha === usuario_fiscal.get('senha')) {
          return usuario_fiscal;
        } else {
          var err = new Error("senha incorreta");
          err.authentication_event = true;
          throw err;
        }
      });
  },
  procurar: function (tax, then, fail) {
    UsuarioFiscal.forge().query(function (qb) {
      qb.join('pessoa', 'pessoa.id_pessoa', '=', 'usuario_fiscal.pessoa_id');
      qb.join('pessoa_fisica', 'pessoa_fisica.pessoa_id', '=', 'pessoa.id_pessoa');
      qb.where('usuario_fiscal.pessoa_id', tax.pessoa_id);
      qb.where('usuario_fiscal.ativo', '=', 'true');
      qb.select('usuario_fiscal.*', 'pessoa.*', 'pessoa_fisica.*');
    }).fetch().then(function (model) {
      then(model);
    }).catch(function (err) {
      fail(err);
    });
  }
});

module.exports = UsuarioFiscal;
