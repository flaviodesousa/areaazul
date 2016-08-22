'use strict';

var _ = require('lodash');
var moment = require('moment');

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const log = AreaAzul.log;
var Pessoa = Bookshelf.model('Pessoa');

var PessoaFisica = Bookshelf.Model.extend({
  tableName: 'pessoa_fisica'
}, {
  _cadastrar: function(pf, options) {
    var optionsInsert = _.merge({ method: 'insert' }, options || {});
    return Pessoa
      .forge({
        nome: pf.nome,
        email: pf.email,
        telefone: pf.telefone
      })
      .save(null, optionsInsert)
      .then(function(pessoa) {
        var dataNascimento = null;
        if (pf.data_nascimento) {
          dataNascimento = moment(pf.data_nascimento, 'DD-MM-YYYY', true);
        }
        return PessoaFisica
          .forge({
            cpf: pf.cpf,
            data_nascimento: dataNascimento,
            id: pessoa.id
          })
          .save(null, optionsInsert);
      });
  },
  cadastrar: function(pessoaFisica) {
    var PessoaFisica = this;

    return Bookshelf.transaction(function(t) {
      return PessoaFisica
        ._cadastrar(pessoaFisica, { transacting: t });
    });
  },
  alterar: function(pf, options, id) {
    var optionsUpdate = _.merge({}, options, {
      method: 'update'
    }, {
      patch: true
    });

    return new Pessoa({ id: id })
      .fetch(options)
      .then(function(pessoa) {
        return pessoa
          .save({
            nome: pf.nome,
            email: pf.email,
            telefone: pf.telefone
          }, optionsUpdate);
      })
      .then(function(pessoa) {
        return PessoaFisica
          .forge({ id: pessoa.id })
          .fetch()
          .then(function(pessoaFisica) {

            return pessoaFisica
              .save({
                cpf: pf.cpf,
                data_nascimento: pf.data_nascimento,
                ativo: true,
                id: pessoa.id
              }, optionsUpdate);
          });
      });
  },

  CPFnovo: function(person, then, fail) {
    this
      .forge({ cpf: person.cpf })
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
  buscarPessoaFisica: function(cpf) {
    this.forge({ cpf: cpf })
      .fetch()
      .then(function(pf) {
        if (pf) {
          return pf;
        }
        var err = new AreaAzul.BusinessException(
          'PessoaFisica: não há pessoa física com este CPF',
          { cpf: cpf });
        log.warn(err.message, err.details);
        throw err;
      });
  },
  procurarCPF: function(cpf) {
    return this.forge({
      cpf: cpf
    }).fetch();
  }
});
Bookshelf.model('PessoaFisica', PessoaFisica);

module.exports = PessoaFisica;

