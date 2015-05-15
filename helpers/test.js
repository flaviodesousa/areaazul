'use strict';

var Promise = require('bluebird');

var AreaAzul = require('../areaazul');
var Fiscalizacoes = AreaAzul.collections.Fiscalizacoes;
var UsuarioFiscal = AreaAzul.models.UsuarioFiscal;
var Usuario = AreaAzul.models.usuario.Usuario;
var UsuarioAdministrativo = AreaAzul.models.UsuarioAdministrativo;
var Pessoa = AreaAzul.models.pessoa.Pessoa;
var PessoaFisica = AreaAzul.models.pessoafisica.PessoaFisica;
var Contas = AreaAzul.collections.Contas;

function _apagarContasDePessoa(id) {
  if (!id) {
    return Promise.resolve(null);
  }
  return Contas
    .forge()
    .query()
    .where({pessoa_id: id})
    .delete()
    .thenReturn();
}

function _apagarPessoaFisica(id) {
  if (!id) {
    return Promise.resolve(null);
  }
  return PessoaFisica
    .forge({pessoa_id: id})
    .destroy()
    .then(function() {
      return _apagarContasDePessoa(id);
    })
    .then(function() {
      return Pessoa
        .forge({id_pessoa: id})
        .destroy();
    });
}

exports.apagarUsuarioFiscalPorCPF = function(cpf) {
  var pessoaId = null;
  return PessoaFisica
    .forge({cpf: cpf})
    .fetch()
      .then(function(pf) {
        if (pf === null) {
          return Promise.resolve(null);
        }
        pessoaId = pf.id;
        return Fiscalizacoes
          .forge({fiscal_id: pessoaId})
          .fetch()
          .then(function(fiscalizacoes) {
            return fiscalizacoes.each(function(f) {
              f.destroy();
            });
          });
      })
      .then(function() {
        if (pessoaId === null) {
          return Promise.resolve(null);
        }
        return UsuarioFiscal
          .forge({pessoa_id: pessoaId})
          .destroy();
      })
      .then(function() {
        return _apagarPessoaFisica(pessoaId);
      });
};

exports.apagarUsuarioPorLogin = function(login) {
  var pessoaId = null;
  return Usuario
    .forge({login: login})
    .fetch()
    .then(function(usuario) {
      if (!usuario) {
        return Promise.resolve(null);
      }
      pessoaId = usuario.id;
      return usuario
        .destroy();
    })
    .then(function() {
      return _apagarPessoaFisica(pessoaId);
    });
};

exports.apagarUsuarioAdministrativoPorLogin = function(login) {
  var pessoaId = null;
  return UsuarioAdministrativo
    .forge({login: login})
    .fetch()
    .then(function(usuario) {
      if (!usuario) {
        return Promise.resolve(null);
      }
      pessoaId = usuario.id;
      return usuario
        .destroy();
    })
    .then(function() {
      return _apagarPessoaFisica(pessoaId);
    });
};
