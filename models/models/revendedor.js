'use strict';

var _ = require('lodash');
var validator = require('validator');
var AreaAzul = require('../../areaazul.js');
var Bookshelf = AreaAzul.db.Bookshelf.conexaoMain;
var PessoaFisica = require('./pessoa_fisica').PessoaFisica;
var UsuarioRevendedor = require('./usuario_revendedor');
var PessoaJuridica = require('./pessoa_juridica');
var validation = require('./validation');
var util = require('../../helpers/util');
var Conta = require('./conta');

var Revendedor = Bookshelf.Model.extend({
  tableName: 'revendedor',
  idAttribute: 'pessoa_id'
}, {
  cadastrar: function(dealer) {
    return Bookshelf.transaction(function(t) {
      var options = {
        transacting: t
      };
      var optionsInsert = _.merge({}, options, {
        method: 'insert'
      });
      var idPessoa = null;
      var idRevendedor = null;
      var senha = util.criptografa(dealer.senha);

      return Revendedor
        .validarRevenda(dealer)
        .then(function(messages) {
          if (messages.length) {
            throw new AreaAzul
              .BusinessException(
                'Nao foi possivel cadastrar nova Revenda. Dados invalidos',
                messages);
          }
          return messages;
        })
        .then(function() {
          if (dealer.cnpj) {
            return PessoaJuridica
              ._cadastrar(dealer, options);
          }
          return PessoaFisica
            ._cadastrar(dealer, options);
        })
        .then(function(pessoa) {
          idPessoa = pessoa.id;
          return Revendedor._cadastrar(pessoa, options);
        })
        .then(function() {
          return PessoaFisica
            ._cadastrar(dealer, options);
        })
        .then(function(pf) {
          idPessoa = pf.id;
          return Revendedor._cadastrar(pf, options);
        })
        .then(function(revenda) {
          idRevendedor = revenda.get('pessoa_id');
          return new UsuarioRevendedor({
              login: dealer.login,
              senha: senha,
              acesso_confirmado: true,
              ativo: true,
              autorizacao: dealer.autorizacao,
              revendedor_id: idRevendedor,
              pessoa_id: idPessoa
            })
            .save(null, optionsInsert);
        });
    });
  },
  _cadastrar: function(pessoa, options) {
    var optionsInsert = _.merge({ method: 'insert' }, options || {});

    return Conta
      ._cadastrar(null, options)
      .then(function(conta) {
        return new Revendedor({
            ativo: true, pessoa_id: pessoa.id, conta_id: conta.id
          })
          .save(null, optionsInsert);
      });
  },

  validarRevenda: function(dealer) {
    var message = [];

    if (!dealer.nome) {
      message.push({
        attribute: 'nome',
        problem: 'Nome obrigatório!'
      });
    }

    if (!dealer.email) {
      message.push({
        attribute: 'email',
        problem: 'Email obrigatório!'
      });
    }

    if (!dealer.login) {
      message.push({
        attribute: 'login',
        problem: 'Login obrigatório!'
      });
    }

    if (!validator.isEmail(dealer.email)) {
      message.push({
        attribute: 'email',
        problem: 'Email inválido!'
      });
    }

    if (!dealer.cpf) {
      message.push({
        attribute: 'cpf',
        problem: 'CPF é obrigatório!'
      });
    }

    if (!validation.isCPF(dealer.cpf)) {
      message.push({
        attribute: 'cpf',
        problem: 'CPF inválido!'
      });
    }

    if (!dealer.termo_servico) {
      message.push({
        attribute: 'termo_servico',
        problem:
          'Para realizar o cadastro precisa aceitar nossos termos de serviço!'
      });
    }

    return PessoaFisica
      .procurarCPF(dealer.cpf)
      .then(function(pessoafisica) {
        if (pessoafisica) {
          message.push({
            attribute: 'cpf',
            problem: 'CPF já cadastrado!'
          });
        }

        return message;
      })
      .then(function() {
        return UsuarioRevendedor
          .procurarLogin(dealer.login)
          .then(function(usuariorevendedor) {
            if (usuariorevendedor) {
              message.push({
                attribute: 'login',
                problem: 'Login já cadastrado!'
              });
            }

            return message;
          });
      })
      .then(function(message) {
        if (!dealer.cnpj) {
          return message;
        }

        if (!dealer.nome_fantasia) {
          message.push({
            attribute: 'nome_fantasia',
            problem: 'Nome fantasia obrigatório!'
          });
        }

        if (!dealer.razao_social) {
          message.push({
            attribute: 'razao_social',
            problem: 'Razao social obrigatório!'
          });
        }

        if (validation.isCNPJ(dealer.cnpj) === false) {
          message.push({
            attribute: 'cnpj',
            problem: 'Cnpj inválido!'
          });
        }

        return PessoaJuridica
          .procurarCNPJ(dealer.cnpj)
          .then(function(pessoajuridica) {
            if (pessoajuridica) {
              message.push({
                attribute: 'cnpj',
                problem: 'CNPJ já cadastrado!'
              });
            }

            return message;
          });
      });
  },

  buscarRevendedor: function(user, then, fail) {
    Revendedor
      .forge()
      .query(function(qb) {
        qb.join('pessoa', 'pessoa.id_pessoa', '=',
          'revendedor.pessoa_id');
        qb.join('usuario_revendedor',
          'usuario_revendedor.revendedor_id', '=',
          'revendedor.pessoa_id');
        qb.join('conta', 'conta.pessoa_id', '=', 'pessoa.id_pessoa');
        qb.where('usuario_revendedor.pessoa_id',
          user.pessoa_id);
        qb.select('revendedor.*', 'usuario_revendedor.*', 'pessoa.*',
          'conta.*');
      })
      .fetch()
      .then(function(model) {
        then(model);
      }).catch(function(err) {
        fail(err);
      });
  }
});

module.exports = Revendedor;
