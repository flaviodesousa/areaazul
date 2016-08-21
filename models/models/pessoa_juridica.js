'use strict';

var _ = require('lodash');
const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const Pessoa = Bookshelf.model('Pessoa');

var PessoaJuridica = Bookshelf.Model.extend({
  tableName: 'pessoa_juridica'
}, {
  _cadastrar: function(pj, options) {
    var optionsInsert = _.merge({ method: 'insert' }, options || {});
    return Pessoa
      .forge({
        nome: pj.nome,
        email: pj.email,
        telefone: pj.telefone,
        ativo: true
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
            pessoa_id: pessoa.id
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
    return this.forge({ cnpj: cnpj }).fetch();
  }
});
Bookshelf.model('PessoaJuridica', PessoaJuridica);

module.exports = PessoaJuridica;
