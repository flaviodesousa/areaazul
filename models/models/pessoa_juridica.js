'use strict';

const _ = require('lodash');
const validation = require('./validation');
const AreaAzul = require('../../areaazul');
const log = AreaAzul.log;
const Bookshelf = AreaAzul.db;
const Pessoa = Bookshelf.model('Pessoa');

var PessoaJuridica = Bookshelf.Model.extend({
  tableName: 'pessoa_juridica',
  pessoa: function() {
    return this.hasOne('Pessoa', 'id');
  }
}, {
  _camposValidos: function(camposPessoaJuridica, options) {
    var messages = [];

    if (!camposPessoaJuridica.nome_fantasia) {
      messages.push({
        attribute: 'nome_fantasia',
        problem: 'Nome fantasia obrigatório!'
      });
    }

    if (!camposPessoaJuridica.razao_social) {
      messages.push({
        attribute: 'razao_social',
        problem: 'Razão social obrigatória!'
      });
    }

    if (validation.isCNPJ(camposPessoaJuridica.cnpj) === false) {
      messages.push({
        attribute: 'cnpj',
        problem: 'CNPJ inválido!'
      });
    }

    return Pessoa
      ._camposValidos(camposPessoaJuridica, options)
      .then(function(messagesPessoa) {
        messages = _.concat(messages, messagesPessoa);
        return messages;
      });
  },
  _cadastrar: function(camposPessoaJuridica, options) {
    var optionsInsert = _.merge({ method: 'insert' }, options || {});
    return PessoaJuridica
      ._camposValidos(camposPessoaJuridica, options)
      .then(messages => {
        if (messages && messages.length) {
          const err = new AreaAzul.BusinessException(
            'Não foi possível cadastrar. Dados inválidos.', {
              messages: messages
            });
          log.warn(err.message, err.details);
          throw err;
        }
      })
      .then(() => {
        return Pessoa
          ._cadastrar(camposPessoaJuridica, options);
      })
      .then(function(pessoa) {
        return new PessoaJuridica({
          cnpj: camposPessoaJuridica.cnpj,
          nome_fantasia: camposPessoaJuridica.nome_fantasia,
          razao_social: camposPessoaJuridica.razao_social,
          contato: camposPessoaJuridica.telefone,
          id: pessoa.id
        })
          .save(null, optionsInsert);
      });
  },
  cadastrar: function(camposPessoaJuridica) {
    return Bookshelf.transaction(function(t) {
      return PessoaJuridica
        ._cadastrar(camposPessoaJuridica, { transacting: t });
    });
  },
  _buscarPorCNPJ: function(cnpj, options) {
    return PessoaJuridica.forge({ cnpj: cnpj })
      .fetch(options);
  }
});
Bookshelf.model('PessoaJuridica', PessoaJuridica);

module.exports = PessoaJuridica;
