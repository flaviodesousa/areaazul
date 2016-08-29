'use strict';

var _ = require('lodash');
var validator = require('validator');
const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;

var validation = require('./validation');
var util = require('../../helpers/util');

const PessoaFisica = Bookshelf.model('PessoaFisica');
const PessoaJuridica = Bookshelf.model('PessoaJuridica');
const Conta = Bookshelf.model('Conta');

var Revendedor = Bookshelf.Model.extend({
  tableName: 'revendedor'
}, {
  _cadastrar: function(revendedorFields, options) {
    var idPessoa = null;
    var revendedor = null;
    var senha = util.criptografa(revendedorFields.senha);

    return Revendedor
      .validarRevenda(revendedorFields)
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
        // Verifica se revendedor é pessoa jurídica...
        if (revendedorFields.cnpj) {
          // ...Se for, cadastra, não pode existir antes
          return PessoaJuridica
            ._cadastrar(revendedorFields, options);
        }
        // Mas se for pessoa física, pode ser que já exista
        // (pode ser usuária, por exemplo)
        return PessoaFisica
          .buscarPorCPF(revendedorFields.cpf)
          .then(function(pessoaFisica) {
            // Se já existe a pessoa física...
            if (pessoaFisica) {
              // ...Use!
              return pessoaFisica;
            }
            // Se não: Crie!
            return PessoaFisica
              ._cadastrar(revendedorFields, options);
          })
      })
      .then(function(pessoa) {
        idPessoa = pessoa.id;
        return Revendedor._salvarRevenda(pessoa, options);
      })
      .then(function() {
        return PessoaFisica
          ._cadastrar(revendedorFields, options);
      })
      .then(function(pf) {
        idPessoa = pf.id;
        return Revendedor._salvarRevenda(pf, options);
      })
      .then(function(r) {
        revendedor = r;
        const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');
        return UsuarioRevendedor
          ._inserir({
            nome: revendedorFields.nome,
            cpf: revendedorFields.cpf,
            data_nascimento: revendedorFields.data_nascimento,
            login: revendedorFields.login,
            email: revendedorFields.email,
            senha: senha,
            acesso_confirmado: true,
            ativo: true,
            autorizacao: revendedorFields.autorizacao,
            termo_servico: true,
            revendedor_id: r.id,
            pessoa_fisica_id: idPessoa
          }, options);
      })
      .return(revendedor);
  },
  cadastrar: function(revendedor) {
    var Revendedor = this;
    return Bookshelf.transaction(function(t) {
      return Revendedor._cadastrar(revendedor, { transacting: t });
    });
  },
  _salvarRevenda: function(pessoa, options) {
    return new Revendedor({ id: pessoa.id })
      .fetch(options)
      .then(function(r) {
        if (r) {
          return r;
        }
        return Conta
          ._cadastrar(null, options)
          .then(function(conta) {
            var optionsInsert = _.merge({ method: 'insert' }, options || {});

            return new Revendedor({
              ativo: true, id: pessoa.id, conta_id: conta.id
            })
              .save(null, optionsInsert);
          });
      })
  },

  validarRevenda: function(revenda) {
    var message = [];

    if (!revenda.nome) {
      message.push({
        attribute: 'nome',
        problem: 'Nome obrigatório!'
      });
    }

    if (!revenda.email) {
      message.push({
        attribute: 'email',
        problem: 'Email obrigatório!'
      });
    } else if (!validator.isEmail(revenda.email)) {
      message.push({
        attribute: 'email',
        problem: 'Email inválido!'
      });
    }

    if (!revenda.cpf) {
      message.push({
        attribute: 'cpf',
        problem: 'CPF é obrigatório!'
      });
    } else if (!validation.isCPF(revenda.cpf)) {
      message.push({
        attribute: 'cpf',
        problem: 'CPF inválido!'
      });
    }

    if (revenda.data_nascimento) {
      if (!util.dataValida(revenda.data_nascimento)) {
        message.push({
          attribute: 'data_nascimento',
          problem: 'Data inválida!'
        })
      }
    }

    if (!revenda.login) {
      message.push({
        attribute: 'login',
        problem: 'Login obrigatório!'
      });
    }

    if (!revenda.termo_servico) {
      message.push({
        attribute: 'termo_servico',
        problem:
          'Para realizar o cadastro precisa aceitar nossos termos de serviço!'
      });
    }

    const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');
    return UsuarioRevendedor
      .procurarLogin(revenda.login)
      .then(function(usuariorevendedor) {
        if (usuariorevendedor) {
          message.push({
            attribute: 'login',
            problem: 'Login já cadastrado!'
          });
        }

        return message;
      })
      .then(function(message) {
        if (!revenda.cnpj) {
          return message;
        }

        if (!revenda.nome_fantasia) {
          message.push({
            attribute: 'nome_fantasia',
            problem: 'Nome fantasia obrigatório!'
          });
        }

        if (!revenda.razao_social) {
          message.push({
            attribute: 'razao_social',
            problem: 'Razao social obrigatório!'
          });
        }

        if (validation.isCNPJ(revenda.cnpj) === false) {
          message.push({
            attribute: 'cnpj',
            problem: 'Cnpj inválido!'
          });
        }

        return PessoaJuridica
          .procurarCNPJ(revenda.cnpj)
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
        qb.join('pessoa', 'pessoa.id', 'revendedor.id')
          .join('usuario_revendedor', 'usuario_revendedor.revendedor_id',
            'revendedor.id')
          .join('conta', 'conta.id', 'revendedor.conta_id')
          .where('usuario_revendedor.pessoa_fisica_id', user.pessoa_fisica_id)
          .select('revendedor.*', 'usuario_revendedor.*', 'pessoa.*',
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
Bookshelf.model('Revendedor', Revendedor);

module.exports = Revendedor;
