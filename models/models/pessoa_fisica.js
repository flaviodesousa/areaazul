'use strict';

const debug = require('debug')('areaazul:models:pessoa_fisica');
const _ = require('lodash');

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const log = AreaAzul.log;
const util = AreaAzul.util;
var Pessoa = Bookshelf.model('Pessoa');

var PessoaFisica = Bookshelf.Model.extend({
  tableName: 'pessoa_fisica'
}, {
  _validar: function(pessoaFisicaFields, options) {

  },
  __cadastrarNova: function(pessoaFisica, options) {
    var optionsInsert = _.merge({ method: 'insert' }, options || {});
    return Pessoa
      .forge({
        nome: pessoaFisica.nome,
        email: pessoaFisica.email,
        telefone: pessoaFisica.telefone
      })
      .save(null, optionsInsert)
      .then(function(pessoa) {
        return PessoaFisica
          .forge({
            cpf: pessoaFisica.cpf,
            data_nascimento: util.dataValida(pessoaFisica.data_nascimento),
            id: pessoa.id
          })
          .save(null, optionsInsert);
      });
  },
  __atualizarExistente: function(
    pessoaFisicaFields, pessoaFisicaRecord, options) {
    var x = new Pessoa({ id: pessoaFisicaRecord.id }).fetch(options);
    debug('x', x);
    return x
      .then(function(p) {
        debug('__atualizarExistente() Pessoa found', p);
        if (!p) {
          throw new AreaAzul.BusinessException(
            'PessoaFisica sem Pessoa equivalente', {
              fields: pessoaFisicaFields,
              pessoaFisica: pessoaFisicaRecord,
              options: options
            });
        }
        return p
          .save({
            nome: pessoaFisicaFields.nome,
            email: pessoaFisicaFields.email,
            telefone: pessoaFisicaFields.telefone }, options);
      })
      .then(function() {
        return pessoaFisicaRecord
          .save({
            data_nascimento: util.dataValida(pessoaFisicaFields.data_nascimento)
          }, options)
      });
  },
  _cadastrar: function(pessoaFisicaFields, options) {
    var PessoaFisica = this;
    return new PessoaFisica({ cpf: pessoaFisicaFields.cpf })
      .fetch(options)
      .then(function(pessoaFisicaRecord) {
        if (pessoaFisicaRecord) {
          return PessoaFisica.__atualizarExistente(
            pessoaFisicaFields, pessoaFisicaRecord, options);
        }
        return PessoaFisica.__cadastrarNova(pessoaFisicaFields, options);
      });
  },
  cadastrar: function(pessoaFisica) {
    log.info('cadastrar()', pessoaFisica);
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
  buscarPorCPF: function(cpf) {
    return new this({ cpf: cpf })
      .fetch();
  }
});
Bookshelf.model('PessoaFisica', PessoaFisica);

module.exports = PessoaFisica;

