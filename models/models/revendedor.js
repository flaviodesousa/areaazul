'use strict';

const _ = require('lodash');
const AreaAzul = require('../../areaazul');
const Bookshelf = require('../../database');

const PessoaFisica = Bookshelf.model('PessoaFisica');
const PessoaJuridica = Bookshelf.model('PessoaJuridica');
const Conta = Bookshelf.model('Conta');

var Revendedor = Bookshelf.Model.extend({
  tableName: 'revendedor'
}, {
  _cadastrar: function(revendedorFields, options) {
    var idPessoa = null;

    return Revendedor
      .validarRevenda(revendedorFields)
      .then(function(messages) {
        if (messages.length) {
          throw new AreaAzul
            .BusinessException(
            'Não foi possível cadastrar nova Revenda. Dados inválidos',
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
          });
      })
      .then(function(pessoa) {
        idPessoa = pessoa.id;
        return Revendedor._salvarRevenda(pessoa, options);
      })
      .then(function(revendedor) {
        const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');
        return UsuarioRevendedor
          ._inserir({
            nome: revendedorFields.nome,
            cpf: revendedorFields.cpf,
            data_nascimento: revendedorFields.data_nascimento,
            login: revendedorFields.login,
            email: revendedorFields.email,
            nova_senha: revendedorFields.nova_senha,
            conf_senha: revendedorFields.conf_senha,
            acesso_confirmado: true,
            ativo: true,
            autorizacao: revendedorFields.autorizacao,
            termo_servico: true,
            revendedor_id: revendedor.id,
            pessoa_fisica_id: idPessoa
          }, options)
          .return(revendedor);
      });
  },
  cadastrar: function(revendedor) {
    var Revendedor = this;
    return Bookshelf.transaction(function(t) {
      return Revendedor._cadastrar(revendedor, { transacting: t });
    });
  },
  _salvarRevenda: function(pessoa, options) {
    return new Revendedor({ id: pessoa.id })
      .fetch(_.merge({ require: true }, options))
      .catch(Bookshelf.NotFoundError, function() {
        return Conta
          ._cadastrar(null, options)
          .then(function(conta) {
            var optionsInsert = _.merge({ method: 'insert' }, options || {});

            return new Revendedor({
              id: pessoa.id, conta_id: conta.id
            })
              .save(null, optionsInsert);
          });
      });
  },

  validarRevenda: function(revenda, options) {
    var message = [];

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

    return PessoaFisica
      ._camposValidos(revenda, options)
      .then(function(messagesPessoaFisica) {
        message.concat(messagesPessoaFisica);
        const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');
        return UsuarioRevendedor
          ._procurarLogin(revenda.login, options);
      })
      .then(function(usuariorevendedor) {
        if (usuariorevendedor) {
          message.push({
            attribute: 'login',
            problem: 'Login já cadastrado!'
          });
        }

        return message;
      })
      .then(function() {
        if (!revenda.cnpj) {
          return message;
        }

        return PessoaJuridica
          ._camposValidos(revenda, options)
          .then(function(messagesPessoaJuridica) {
            message.concat(messagesPessoaJuridica);
            return PessoaJuridica
              ._buscarPorCNPJ(revenda.cnpj, options);
          })
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

  buscarRevendedor: function(user) {
    return Revendedor
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
      .fetch();
  }
});
Bookshelf.model('Revendedor', Revendedor);

module.exports = Revendedor;
