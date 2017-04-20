'use strict';

const _ = require('lodash');
const AreaAzul = require('../areaazul');
const Bookshelf = require('../database');

const Configuracao = Bookshelf.model('Configuracao');
const PessoaFisica = Bookshelf.model('PessoaFisica');
const PessoaJuridica = Bookshelf.model('PessoaJuridica');
const Conta = Bookshelf.model('Conta');
const MovimentacaoConta = Bookshelf.model('MovimentacaoConta');
const Usuario = Bookshelf.model('Usuario');

const Revendedor = Bookshelf.Model.extend({
  tableName: 'revendedor',
  conta: function() {
    return this.belongsTo('Conta', 'conta_id');
  },
  usuarios: function() {
    return this.hasMany('UsuarioRevendedor');
  }
}, {
  _cadastrar: function(revendedorFields, options) {
    let idPessoa = null;

    return Revendedor
      ._camposValidos(revendedorFields, options)
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
          ._buscarPorCPF(revendedorFields.cpf, options)
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
  _salvarRevenda: function(pessoa, options) {
    return new Revendedor({ id: pessoa.id })
      .fetch(_.merge({ require: true }, options))
      .catch(Bookshelf.NotFoundError, function() {
        return Conta
          ._cadastrar(null, options)
          .then(function(conta) {
            const optionsInsert = _.merge({ method: 'insert' }, options || {});

            return new Revendedor({
              id: pessoa.id,
              conta_id: conta.id,
              tipo: 'normal'
            })
              .save(null, optionsInsert);
          });
      });
  },

  _camposValidos: function(revenda, options) {
    let messages = [];

    if (!revenda.login) {
      messages.push({
        attribute: 'login',
        problem: 'Login obrigatório!'
      });
    }

    if (!revenda.termo_servico) {
      messages.push({
        attribute: 'termo_servico',
        problem:
          'Para realizar o cadastro precisa aceitar nossos termos de serviço!'
      });
    }

    return PessoaFisica
      ._camposValidos(revenda, options)
      .then(function(messagesPessoaFisica) {
        messages.push.apply(messages, messagesPessoaFisica);
        const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');
        return UsuarioRevendedor
          ._procurarLogin(revenda.login, options);
      })
      .then(function(usuariorevendedor) {
        if (usuariorevendedor) {
          messages.push({
            attribute: 'login',
            problem: 'Login já cadastrado!'
          });
        }
      })
      .then(function() {
        if (!revenda.cnpj) {
          return;
        }

        return PessoaJuridica
          ._camposValidos(revenda, options)
          .then(function(messagesPessoaJuridica) {
            messages.push.apply(messages, messagesPessoaJuridica);
            return PessoaJuridica
              ._buscarPorCNPJ(revenda.cnpj, options);
          })
          .then(function(pessoajuridica) {
            if (pessoajuridica) {
              messages.push({
                attribute: 'cnpj',
                problem: 'CNPJ já cadastrado!'
              });
            }
          });
      })
      .then(() => messages);
  },
  _buscarPorIdUsuarioRevendedor: id => {
    return new Revendedor()
      .query(function(qb) {
        qb.whereExists(function() {
          this
            .select('*').from('usuario_revendedor')
            .where({ pessoa_fisica_id: id });
        });
      })
      .fetch({ withRelated: [ 'conta' ] });
  },
  _buscarPorId: (id, options) => new Revendedor({ id: id })
    .fetch(_.merge({ withRelated: [ 'conta' ] }, options)),
  /**
   * Adiciona créditos na conta da revenda
   * @param {object} camposCompra - descrição da compra
   * @param {number} camposCompra.idRevendedor - revendedor comprando créditos
   * @param {string} camposCompra.valorCompra - créditos comprados
   * @param {object} options - opções do knex
   * @param {object} options.transacting - transação ativa
   * @returns {Promise.<MovimentacaoConta>}
   * @throws AreaAzul.BusinessException
   */
  _comprarCreditos: (camposCompra, options) => {
    const movimentacao = {
      historico: `Compra de ${camposCompra.valorCompra} créditos pela revenda ${camposCompra.idRevendedor}`,
      tipo: 'compraCreditosPelaRevenda',
      valor: camposCompra.valorCompra,
    };

    return Configuracao
      ._buscar()
      .then(configuracao => MovimentacaoConta
        ._inserirCredito(
          _.merge({ conta_id: configuracao.related('conta').id }, movimentacao),
          options))
      .then(() => Revendedor
        ._buscarPorId(camposCompra.idRevendedor, options))
      .then(revendedor => MovimentacaoConta
        ._inserirCredito(
          _.merge({ conta_id: revendedor.related('conta').id }, movimentacao),
          options));
  },
  /**
   * Transfere créditos da conta da revenda para conta do usuário
   * @param {object} camposVenda - descrição da venda
   * @param {number} camposVenda.idRevendedor - revendedor vendendo créditos
   * @param {number} camposVenda.idUsuario - usuário comprando créditos
   * @param {string} camposVenda.valorVenda - créditos vendidos
   * @param {object} options - opções do knex
   * @param {object} options.transacting - transação ativa
   * @returns {Promise.<MovimentacaoConta>}
   * @throws AreaAzul.BusinessException
   */
  _venderCreditos: (camposVenda, options) => {
    const movimentacao = {
      historico: `Compra de ${camposVenda.valorVenda} créditos pela revenda ${camposVenda.idRevendedor} ao usuario ${camposVenda.idUsuario}`,
      tipo: 'vendaCreditosPelaRevenda',
      valor: camposVenda.valorVenda,
    };

    return Usuario
      ._buscarPorId(camposVenda.idUsuario, options)
      .then(usuario => MovimentacaoConta
        ._inserirCredito(
          _.merge({ conta_id: usuario.related('conta').id }, movimentacao),
          options))
      .then(() => Revendedor
        ._buscarPorId(camposVenda.idRevendedor, options))
      .then(revendedor => MovimentacaoConta
        ._inserirDebito(
          _.merge({ conta_id: revendedor.related('conta').id }, movimentacao),
          options));
  }
});
Bookshelf.model('Revendedor', Revendedor);

const Revendedores = Bookshelf.Collection.extend({
  model: Revendedor
});
Bookshelf.collection('Revendedores', Revendedores);
