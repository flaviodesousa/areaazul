'use strict';

const _ = require('lodash');
const validation = require('./validation');

const AreaAzul = require('../../areaazul');
const Bookshelf = require('../../database');
const AreaAzulUtils = require('areaazul-utils');
const Pessoa = Bookshelf.model('Pessoa');

const PessoaFisica = Bookshelf.Model.extend({
  tableName: 'pessoa_fisica',
  pessoa: function() {
    return this.hasOne('Pessoa', 'id');
  }
}, {
  _camposValidos: function(pessoaFisicaFields, options) {
    let messages = [];

    if (!pessoaFisicaFields.cpf) {
      messages.push({
        attribute: 'cpf',
        problem: 'CPF é obrigatório!'
      });
    } else if (!validation.isCPF(pessoaFisicaFields.cpf)) {
      messages.push({
        attribute: 'cpf',
        problem: 'CPF inválido!'
      });
    }

    if (pessoaFisicaFields.data_nascimento) {
      if (!AreaAzulUtils.dataValida(pessoaFisicaFields.data_nascimento)) {
        messages.push({
          attribute: 'data_nascimento',
          problem: 'Data inválida!'
        });
      }
    }

    return Pessoa
      ._camposValidos(pessoaFisicaFields, options)
      .then(function(messagesPessoa) {
        messages.push.apply(messages, messagesPessoa);
        return messages;
      });
  },
  _camposValidosInclusao: function(pessoaFisicaFields, options) {
    let messages = [];
    return this
      ._camposValidos(pessoaFisicaFields, options)
      .then(function(messagesPessoa) {
        messages.push.apply(messages, messagesPessoa);
        return PessoaFisica
          ._buscarPorCPF(pessoaFisicaFields.cpf, options)
          .then(function(pf) {
            if (pf) {
              messages.push({
                attribute: 'cpf',
                problem: 'CPF já cadastrado!'
              });
            }
            return messages;
          });
      });
  },
  __cadastrarNova: function(camposPessoaFisica, options) {
    const optionsInsert = _.merge({ method: 'insert' }, options || {});
    return PessoaFisica
      ._camposValidosInclusao(camposPessoaFisica, options)
      .then(function(messages) {
        if (messages.length) {
          throw new AreaAzul
            .BusinessException(
            'Não foi possível cadastrar nova Pessoa. Dados inválidos',
            messages);
        }
        return messages;
      })
      .then(function() {
        return Pessoa
          ._cadastrar(camposPessoaFisica, options);
      })
      .then(function(pessoa) {
        return new PessoaFisica({
            cpf: camposPessoaFisica.cpf,
            data_nascimento: AreaAzulUtils.dataValida(
              camposPessoaFisica.data_nascimento),
            id: pessoa.id
          })
          .save(null, optionsInsert);
      });
  },
  __atualizarExistente: function(
    pessoaFisicaFields, pessoaFisicaRecord, options) {
    return new Pessoa({ id: pessoaFisicaRecord.id })
      .fetch(options)
      .then(function(p) {
        if (!p) {
          throw new AreaAzul.BusinessException(
            'PessoaFisica sem Pessoa equivalente (sem FK?)', {
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
            data_nascimento: AreaAzulUtils.dataValida(
              pessoaFisicaFields.data_nascimento)
          }, _.merge({ method: 'update', patch: true }, options));
      });
  },
  _cadastrar: function(pessoaFisicaFields, options) {
    let PessoaFisica = this;
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
  _alterar: function(pf, id, options) {
    const optionsUpdate = _.merge({ method: 'update', patch: true }, options);

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
          .fetch(options)
          .then(function(pessoaFisica) {
            return pessoaFisica
              .save({
                cpf: pf.cpf,
                data_nascimento: AreaAzulUtils.dataValida(pf.data_nascimento),
                id: pessoa.id
              }, optionsUpdate);
          });
      });
  },
  _buscarPorCPF: function(cpf, options) {
    return new this({ cpf: cpf })
      .fetch(options);
  }
});
Bookshelf.model('PessoaFisica', PessoaFisica);

module.exports = PessoaFisica;

