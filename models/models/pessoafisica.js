'use strict';

var _ = require('lodash');
var validator = require("validator");
var validation = require("./validation");
var util = require('./util');

var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa').Pessoa;

var PessoaFisica = Bookshelf.Model.extend({
  tableName: 'pessoa_fisica',
  idAttribute: 'pessoa_id'
}, {
  _cadastrar: function(pf, options) {
    var options_ins = _.merge(options||{}, {method: 'insert'});
    return Pessoa
      .forge({
        nome: pf.nome,
        email: pf.email,
        telefone: pf.telefone,
        ativo: true
      })
      .save(null, options)
      .then(function (pessoa) {
        return PessoaFisica
          .forge({
            cpf: pf.cpf,
            data_nascimento: pf.data_nascimento,
            sexo: pf.sexo,
            ativo: true,
            pessoa_id: pessoa.id
          })
          .save(null, options_ins);
      });
  },
  cadastrar: function (tax) {
    var pessoa_fisica = null;
    var PessoaFisica = this;

    return Bookshelf.transaction(function (t) {
      return PessoaFisica
        ._cadastrar(tax, {transacting: t})
        .then(function(pf) {
          pessoa_fisica = pf;
        });
      })
      .then(function () {
        return pessoa_fisica;
      });
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
