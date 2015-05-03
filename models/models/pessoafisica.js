'use strict';

var _ = require('lodash');
var validator = require("validator");
var validation = require("./validation");
var util = require('./util');
var logger = require('winston');

var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa').Pessoa;

var PessoaFisica = Bookshelf.Model.extend({
  tableName: 'pessoa_fisica',
  idAttribute: 'pessoa_id'
}, {
  cadastrar: function (tax, then, fail) {
    var pessoa_fisica = null;
    var PessoaFisica = this;

    Bookshelf.transaction(function (t) {
      var trx = {transacting: t};
      var trx_ins = _.merge(trx, {method: 'insert'});

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
        })
        .then(function (pf) {
          pessoa_fisica = pf;
        });
    })
      .then(
        function () {
          then(pessoa_fisica);
        },
        function (e) {
          fail(e);
        }
      );
  },
  CPFnovo: function (person, then, fail) {
    this
      .forge({cpf: person.cpf})
      .fetch()
      .then(function (model) {
        if (model !== null) {
          throw new Error("Cpf já existe!!!");
        }
        then(model);
      })
      .catch(function (err) {
        fail(err);
      });
  }
});

exports.PessoaFisica = PessoaFisica;

exports.validate = function (pessoaFisica) {

  if (validator.isNull(pessoaFisica.attributes.cpf) === true || pessoaFisica.attributes.cpf === '') {
    util.log("Cpf obrigatório");
    return false;
  }

  if (validation.isCPF(pessoaFisica.attributes.cpf) === false) {
    util.log("Cpf Inválido");
    return false;
  }

  if (pessoaFisica.attributes.data_nascimento === '') {
    util.log("Data Nascimento obrigatório");
    return false;
  }
  /*  if (validation.validarData(individuals.attributes.data_nascimento) == false) {
    util.log("Data Nascimento não pode ser maior ou igual do que a data atual");
    return false;
  }*/
  return true;
};
