'use strict';

var _ = require('lodash');
var validator = require('validator');
var validation = require('./validation');
var util = require('./util');

var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa').Pessoa;

var PessoaFisica = Bookshelf.Model.extend({
  tableName: 'pessoa_fisica',
  idAttribute: 'pessoa_id',
}, {
  _cadastrar: function(pf, options) {
    var optionsInsert = _.merge(options || {}, {method: 'insert'});
    return Pessoa
      .forge({
        nome: pf.nome,
        email: pf.email,
        telefone: pf.telefone,
        ativo: true,
      })
      .save(null, options)
      .then(function(pessoa) {
        return PessoaFisica
          .forge({
            cpf: pf.cpf,
            data_nascimento: pf.data_nascimento,
            sexo: pf.sexo,
            ativo: true,
            pessoa_id: pessoa.id,
          })
          .save(null, optionsInsert);
      });
  },
  cadastrar: function(tax) {
    var pessoaFisica = null;
    var PessoaFisica = this;

    return Bookshelf.transaction(function(t) {
      return PessoaFisica
        ._cadastrar(tax, {transacting: t})
        .then(function(pf) {
          pessoaFisica = pf;
        });
    })
      .then(function() {
        return pessoaFisica;
      });
  },
  CPFnovo: function(person, then, fail) {
    this
      .forge({cpf: person.cpf})
      .fetch()
      .then(function(model) {
        if (model !== null) {
          throw new Error('Cpf já existe!!!');
        }
        then(model);
      })
      .catch(function(err) {
        fail(err);
      });
  },
});

exports.PessoaFisica = PessoaFisica;

exports.validate = function(pessoaFisica) {

  if (validator.isNull(pessoaFisica.attributes.cpf)) {
    util.log('Cpf obrigatório');
    return false;
  }

  if (!validation.isCPF(pessoaFisica.attributes.cpf)) {
    util.log('Cpf Inválido');
    return false;
  }

  if (pessoaFisica.attributes.data_nascimento === '') {
    util.log('Data Nascimento obrigatório');
    return false;
  }

  return true;
};
