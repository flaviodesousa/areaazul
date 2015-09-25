'use strict';

var _ = require('lodash');
var validator = require('validator');
var validation = require('./validation');
var util = require('../../helpers/util');

var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa').Pessoa;

var PessoaFisica = Bookshelf.Model.extend({
  tableName: 'pessoa_fisica',
  idAttribute: 'pessoa_id',
}, {
  _cadastrar: function(pf, options) {
    var optionsInsert = _.merge({}, options || {}, {method: 'insert'});
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
  buscarPessoaFisica: function(cpf){
  this.forge({cpf: cpf})
      .fetch()
      .then(function(pf) {
        if (pf) { 
          return pf; 
        }
        var err = new AreaAzul.BusinessException(
          'PessoaFisica: pessoa fisica não encontrado',
          {cpf: cpf});
        log.warn(err.message, err.details);
        throw err;
      });
  }
});

exports.PessoaFisica = PessoaFisica;

