var _ = require('lodash');
var Promise = require('bluebird');
var bcrypt = require('bcrypt');
var Areaazul_mailer = require('areaazul-mailer');
var moment = require('moment');
var util = require('./util');

var app = require('../../app');
var Bookshelf = app.database.Bookshelf.conexaoMain;
var Pessoa = app.models.pessoa.Pessoa;
var PessoaFisica = app.models.pessoafisica.PessoaFisica;

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

    var senha = tax.senha;
    if (!senha) {
      senha = util.criptografa(util.generate());
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
