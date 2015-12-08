'use strict';

var _ = require('lodash');
var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa').Pessoa;


var PessoaJuridica = Bookshelf.Model.extend({
  tableName: 'pessoa_juridica',
  idAttribute: 'pessoa_id',
}, {
  _cadastrar: function(pj, options) {
    var optionsInsert = _.merge({}, options || {}, {method: 'insert'});
    return Pessoa
      .forge({
        nome: pj.nome,
        email: pj.email,
        telefone: pj.telefone,
        ativo: true,
      })
      .save(null, options)
      .then(function(pessoa) {
        return PessoaJuridica
          .forge({
            cnpj: pj.cnpj,
            nome_fantasia: pj.nome_fantasia,
            razao_social: pj.razao_social,
            contato: pj.telefone,
            ativo: true,
            pessoa_id: pessoa.id,
          })
          .save(null, optionsInsert);
      });
  },
  cadastrar: function(tax) {

    var PessoaJuridica = this;

    return Bookshelf.transaction(function(t) {
      return PessoaJuridica
        ._cadastrar(tax, {transacting: t})
        .then(function(pj) {
          return pj;
        });
    })
      .then(function(pessoaJuridica) {
        return pessoaJuridica;
      });
  },
  procurarCNPJ: function(cnpj) {
      return this.forge({
          cnpj: cnpj
      }).fetch();
  },
});

module.exports = PessoaJuridica;
