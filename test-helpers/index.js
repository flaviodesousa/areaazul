'use strict';

module.exports = function(AreaAzul) {
  let exports = {};

  const _ = require('lodash');
  const debug = require('debug')('areaazul-test-helper');
  const money = require('money-math');

  const aazUtils = require('areaazul-utils');

  const Bookshelf = AreaAzul._internals.Bookshelf;
  const Fiscalizacao = Bookshelf.model('Fiscalizacao');
  const UsuarioFiscal = Bookshelf.model('UsuarioFiscal');
  const Usuario = Bookshelf.model('Usuario');
  const UsuarioAdministrativo = Bookshelf.model('UsuarioAdministrativo');
  const Pessoa = Bookshelf.model('Pessoa');
  const PessoaFisica = Bookshelf.model('PessoaFisica');
  const PessoaJuridica = Bookshelf.model('PessoaJuridica');
  const Conta = Bookshelf.model('Conta');
  const UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');
  const Revendedor = Bookshelf.model('Revendedor');
  const Ativacao = Bookshelf.model('Ativacao');
  const AtivacaoUsuario = Bookshelf.model('AtivacaoUsuario');
  const AtivacaoUsuarioRevendedor = Bookshelf.model('AtivacaoUsuarioRevendedor');
  const AtivacaoUsuarioFiscal = Bookshelf.model('AtivacaoUsuarioFiscal');
  const Veiculo = Bookshelf.model('Veiculo');
  const UsuarioHasVeiculo = Bookshelf.model('UsuarioHasVeiculo');
  const MovimentacaoConta = Bookshelf.model('MovimentacaoConta');
  const Cidade = Bookshelf.model('Cidade');

  function _apagarConta(idConta, trx) {
    return new MovimentacaoConta()
      .query(qb => qb.where({ conta_id: idConta }))
      .destroy({ transacting: trx })
      .then(function() {
        return new Conta({ id: idConta }).destroy({ transacting: trx });
      });
  }

  function _apagarPessoaFisica(id, trx) {
    return new PessoaFisica({ id: id })
      .destroy({ transacting: trx })
      .then(function() {
        return new Pessoa({ id: id })
          .destroy({ transacting: trx });
      });
  }


  function _apagarPessoaJuridica(id, trx) {
    return new PessoaJuridica({ id: id })
      .destroy({ transacting: trx })
      .then(function() {
        return new Pessoa({ id: id })
          .destroy({ transacting: trx });
      });
  }

  function _apagarVeiculo(idVeiculo, trx) {
    return new UsuarioHasVeiculo()
      .query(qb => qb.where({ veiculo_id: idVeiculo }))
      .destroy({ transacting: trx })
      .then(function() {
        return AtivacaoUsuario
          .query(qb => qb.whereExists(function() {
            this.select('*')
              .from('ativacao')
              .where({ veiculo_id: idVeiculo })
              .whereRaw('ativacao_id = ativacao.id');
          }))
          .destroy({ transacting: trx });
      })
      .then(function() {
        return AtivacaoUsuarioRevendedor
          .query(qb => qb.whereExists(function() {
            this.select('*')
              .from('ativacao')
              .where({ veiculo_id: idVeiculo })
              .whereRaw('ativacao_id = ativacao.id');
          }))
          .destroy({ transacting: trx });
      })
      .then(function() {
        return new Ativacao()
          .query(qb => qb.where({ veiculo_id: idVeiculo }))
          .destroy({ transacting: trx });
      })
      .then(function() {
        return new Fiscalizacao()
          .query(qb => qb.where({ veiculo_id: idVeiculo }))
          .destroy({ transacting: trx });
      })
      .then(function() {
        return new Veiculo({ id: idVeiculo })
          .destroy({ transacting: trx });
      });
  }

  function _apagarRevendedor(idRevenda, trx) {
    let idConta = null;
    return new Revendedor({ id: idRevenda })
      .fetch({ transacting: trx })
      .then(function(r) {
        if (!r) {
          return null;
        }
        idConta = r.get('conta_id');
        return new UsuarioRevendedor()
          .query(qb => qb.where({ revendedor_id: idRevenda }))
          .destroy({ transacting: trx })
          .then(function() {
            return new Revendedor({ id: idRevenda })
              .destroy({ transacting: trx });
          })
          .then(function() {
            return _apagarConta(idConta, trx);
          });
      });
  }

  function _apagarRevendedorJuridica(idRevendedor, trx) {
    return _apagarRevendedor(idRevendedor, trx)
      .then(function() {
        return _apagarPessoaJuridica(idRevendedor, trx);
      });
  }

  exports.apagarPessoaJuridica = (id, trx) => {
    return _apagarPessoaJuridica(id, trx);
  };

  exports.apagarPessoaJuridicaPeloCNPJ = (cnpj, trx) => {
    return new PessoaJuridica({ cnpj: cnpj })
      .fetch({ require: true, transacting: trx })
      .then(pj => _apagarPessoaJuridica(pj.id, trx))
      .catch(Bookshelf.NotFoundError, () => null);
  };

  function _apagarRevendedorFisica(idRevendedor, trx) {
    return _apagarRevendedor(idRevendedor, trx)
      .then(function() {
        return _apagarPessoaFisica(idRevendedor, trx);
      });
  }

  function _apagarUsuarioFiscal(idUsuarioFiscal, trx) {
    let contaId;
    return new Fiscalizacao()
      .query(qb => qb.where({ usuario_fiscal_id: idUsuarioFiscal }))
      .destroy({ transacting: trx })
      .then(function() {
        return new UsuarioFiscal({ id: idUsuarioFiscal })
          .fetch({ transacting: trx });
      })
      .then(function(usuFis) {
        if (usuFis) {
          contaId = usuFis.get('conta_id');
        }
      })
      .then(function() {
        return new UsuarioFiscal({ id: idUsuarioFiscal })
          .destroy({ transacting: trx });
      })
      .then(function() {
        return _apagarPessoaFisica(idUsuarioFiscal, trx);
      })
      .then(function() {
        if (contaId) {
          return _apagarConta(contaId, trx);
        }
        return null;
      });
  }

  exports.apagarUsuarioFiscalPorCPF = function(cpf, trx) {
    return new PessoaFisica({ cpf: cpf })
      .fetch({ transacting: trx })
      .then(function(pf) {
        if (pf === null) {
          return null;
        }
        return _apagarUsuarioFiscal(pf.id, trx);
      });
  };

  exports.apagarPessoaFisicaPorCPF = function(cpf, trx) {
    return new PessoaFisica({ cpf: cpf })
      .fetch({ transacting: trx })
      .then(function(pf) {
        if (pf === null) {
          return null;
        }
        return _apagarPessoaFisica(pf.id, trx);
      });
  };

  function _apagarUsuario(usuario, trx) {
    return new UsuarioHasVeiculo()
      .query(qb => qb.where({ usuario_id: usuario.id }))
      .destroy({ transacting: trx })
      .then(function() {
        return AtivacaoUsuario
          .query(qb => qb.where({ usuario_id: usuario.id }))
          .destroy({ transacting: trx });
      })
      .then(() => {
        return Ativacao
          .query(qb => qb.where({ ativador: 'usuario', id_ativador: usuario.id }))
          .destroy({ transacting: trx });
      })
      .then(function() {
        return new Usuario({ id: usuario.id })
          .destroy({ transacting: trx });
      })
      .then(function() {
        return _apagarConta(usuario.get('conta_id'), trx);
      })
      .then(function() {
        return _apagarPessoaFisica(usuario.id, trx);
      });
  }

  exports.apagarUsuarioPorLogin = function(login, trx) {
    return new Usuario({ login: login })
      .fetch({ transacting: trx })
      .then(function(u) {
        if (!u) {
          return null;
        }
        return _apagarUsuario(u, trx);
      });
  };

  function _apagarUsuarioAdministrativo(idUsuarioAdministrativo, trx) {
    return new UsuarioAdministrativo({ id: idUsuarioAdministrativo })
      .destroy({ transacting: trx })
      .then(function() {
        return _apagarPessoaFisica(idUsuarioAdministrativo, trx);
      });
  }

  exports.apagarUsuarioAdministrativoPorLogin = function(login, trx) {
    return new UsuarioAdministrativo({ login: login })
      .fetch({ transacting: trx })
      .then(function(usuario) {
        if (!usuario) {
          return null;
        }
        return _apagarUsuarioAdministrativo(usuario.id, trx);
      });
  };

  exports.apagarRevendedorPorCPF = function(cpf, trx) {
    if (!cpf) {
      return null;
    }
    return new PessoaFisica({ cpf: cpf })
      .fetch({ transacting: trx })
      .then(function(pf) {
        if (!pf) {
          return null;
        }
        return _apagarRevendedorFisica(pf.id, trx);
      });
  };

  exports.apagarRevendedorPorCNPJ = function(cnpj, trx) {
    return new PessoaJuridica({ cnpj: cnpj })
      .fetch({ transacting: trx })
      .then(function(pj) {
        if (!pj) {
          return null;
        }
        return _apagarRevendedorJuridica(pj.id, trx);
      });
  };

  exports.apagarAtivacaoId = _apagarAtivacaoId;
  function _apagarAtivacaoId(id, trx) {
    let ativacao;
    return new Ativacao({ id: id })
      .fetch({ require: true, transacting: trx })
      .then(at => {
        ativacao = at;
        switch (ativacao.get('ativador')) {
          case 'usuario': {
            return new AtivacaoUsuario({ ativacao_id: id });
          }
          case 'revenda': {
            return new AtivacaoUsuarioRevendedor({ ativacao_id: id });
          }
          case 'fiscal': {
            return new AtivacaoUsuarioFiscal({ ativacao_id: id });
          }
        }
      })
      .destroy({ transacting: trx })
      .then(() => ativacao)
      .destroy({ transacting: trx });
  }

  exports.apagarVeiculoPorPlaca = function(placa, trx) {
    placa = aazUtils.placaSemMascara(placa);
    return new Veiculo({ placa: placa })
      .fetch({ transacting: trx })
      .then(function(v) {
        if (!v) {
          return null;
        }
        return _apagarVeiculo(v.id, trx);
      });
  };

  exports.apagarMovimentacaoConta = function(movimentacaoContaId, trx) {
    return new MovimentacaoConta({ id: movimentacaoContaId })
      .destroy({ transacting: trx });
  };

  exports.apagarAtivacao = function(id, trx) {
    return _apagarAtivacaoId(id, trx);
  };

  exports.apagarUsuarioRevendaPorLogin = function(login, trx) {
    return new UsuarioRevendedor({ login: login })
      .fetch({ require: true, transacting: trx })
      .then(usuarioRevendedor => {
        return usuarioRevendedor.destroy({ transacting: trx });
      })
      .catch(Bookshelf.NotFoundError, () => {
      });
  };

  exports.apagarUsuarioRevenda = function(idUsuarioRevenda, trx) {
    if (!idUsuarioRevenda) {
      return null;
    }
    return _apagarRevendedor(idUsuarioRevenda, trx);
  };

  exports.pegarCidade = function(trx) {
    return new Cidade({ id: 1775 })
      .fetch({ withRelated: 'estado', transacting: trx });
  };

  const veiculoParaTeste = [
    {
      cidade_id: 1,
      placa: 'ARE4701',
      tipo: 'moto',
      marca: 'Honda',
      modelo: 'Titan',
      cor: 'Azul',
      ano_fabricado: 2013,
      ano_modelo: 2015
    },
    {
      cidade_id: 1775,
      placa: 'GTA6266',
      tipo: 'utilitário',
      marca: 'Ford',
      modelo: 'F-1000',
      cor: 'Branca',
      ano_fabricado: 1984,
      ano_modelo: 1984
    },
    {
      cidade_id: 1775,
      placa: 'AON6188',
      tipo: 'carro',
      marca: 'Fiat',
      modelo: 'Palio',
      cor: 'Preta',
      ano_fabricado: 2007,
      ano_modelo: 2007
    }
  ];

  function pegarVeiculo(numero, trx) {
    if (isNaN(numero)) {
      numero = 0;
    }
    return Veiculo._buscarPorPlaca(veiculoParaTeste[ numero ].placa, { transacting: trx })
      .catch(Bookshelf.NotFoundError, () => {
        debug('cadastrando veículo de teste', veiculoParaTeste[ numero ]);
        return Veiculo
          ._cadastrar(veiculoParaTeste[ numero ], { transacting: trx });
      });
  }

  exports.pegarVeiculo = pegarVeiculo;

  const usuarioTeste = {
    login: 'usuarioTeste',
    nova_senha: 'senhaTeste',
    conf_senha: 'senhaTeste',
    nome: 'Nome Usuario',
    email: 'usuario-teste-unitario@areaazul.org',
    telefone: '00 0000 0000',
    cpf: '69425782660',
    data_nascimento: '01/04/1981',
    sexo: 'feminino'
  };

  function pegarUsuario(trx) {
    return new Usuario({ login: usuarioTeste.login })
      .fetch({
        withRelated: [ 'pessoaFisica', 'pessoaFisica.pessoa', 'conta' ],
        require: true,
        transacting: trx
      })
      .catch(Bookshelf.NotFoundError, () => {
        debug('cadastrando usuario de teste', usuarioTeste);
        return Usuario
          ._salvar(usuarioTeste, null, { transacting: trx });
      })
      .then(function(usuario) {
        usuario.senha = usuarioTeste.nova_senha;
        return usuario;
      });
  }

  exports.pegarUsuario = pegarUsuario;

  const revendedorPessoaFisicaTeste = {
    nome: 'Nome Revendedor Pessoa Fisica',
    email: 'revendedor-teste-unitario@areaazul.org',
    telefone: '00 0000 0000',
    cpf: '21962139425',
    data_nascimento: '31/03/1977',
    login: 'revendedorPessoaFisicaTeste',
    autorizacao: 'autorizacao teste',
    nova_senha: 'senhaTeste',
    conf_senha: 'senhaTeste',
    termo_servico: true
  };

  function pegarRevendedor(trx) {
    return new PessoaFisica({ cpf: revendedorPessoaFisicaTeste.cpf })
      .fetch({ require: true, transacting: trx })
      .then(function(pf) {
        // Caso 1: existe pessoa, vê se é revendedor
        return new Revendedor({ id: pf.id })
          .fetch({ transacting: trx });
      })
      .catch(Bookshelf.NotFoundError, () => {
        // Caso 2: não existe pessoa ainda, cadastra tudo PF e Revendedor
        debug('cadastrando revendedor de teste', revendedorPessoaFisicaTeste);
        return Revendedor
          ._cadastrar(revendedorPessoaFisicaTeste, { transacting: trx });
      })
      .then(function(revendedor) {
        if (revendedor) {
          return revendedor;
        }
        // Caso 3: existe pessoa, mas não é revendedor, cadastrar Revendedor
        debug('cadastrando revendedor de teste', revendedorPessoaFisicaTeste);
        return Revendedor
          ._cadastrar(revendedorPessoaFisicaTeste, { transacting: trx });
      });
  }

  exports.pegarRevendedor = pegarRevendedor;

  const usuarioRevendedorTeste = {
    login: 'usuarioRevendedorTeste',
    nome: 'usuário Revenda Teste',
    autorizacao: 'funcionario',
    nova_senha: 'senhaTeste',
    conf_senha: 'senhaTeste',
    email: 'usuario-revenda-teste-unitario@areaazul.org',
    cpf: '03472262214',
    data_nascimento: '28/02/1933',
    termo_servico: '1'
  };

  exports.pegarUsuarioRevendedor = function pegarUsuarioRevendedor(trx) {
    return pegarRevendedor(trx)
      .then(function(revendedor) {
        return new UsuarioRevendedor({ login: usuarioRevendedorTeste.login })
          .fetch({
            require: true,
            transacting: trx,
            withRelated: [
              'pessoaFisica', 'pessoaFisica.pessoa', 'revendedor' ]
          })
          .catch(Bookshelf.NotFoundError, () => {
            debug('cadastrando usuario revendedor de teste',
              usuarioRevendedorTeste);
            return UsuarioRevendedor._salvarUsuarioRevenda(
              _.merge({ revendedor_id: revendedor.id },
                usuarioRevendedorTeste), null, { transacting: trx })
              .then(() => {
                return pegarUsuarioRevendedor(trx);
              });
          });
      });
  };

  exports.setSaldo = function(conta, novoSaldo, trx) {
    const diferenca = money.cmp(conta.get('saldo'), novoSaldo);
    if (diferenca === 0) {
      return conta;
    }
    if (diferenca < 0) {
      return MovimentacaoConta
        ._inserirCredito({
            conta_id: conta.id,
            historico: `Crédito teste de ${conta.get('saldo')} para ${novoSaldo}`,
            tipo: 'teste',
            valor: money.subtract(novoSaldo, conta.get('saldo'))
          },
          { transacting: trx })
        .then(() => {
          return new Conta({ id: conta.id })
            .fetch({ require: true });
        });
    }
    // Diferença > 0
    return MovimentacaoConta
      ._inserirDebito({
          conta_id: conta.id,
          historico: `Débito teste de ${conta.get('saldo')} para ${novoSaldo}`,
          tipo: 'teste',
          valor: money.subtract(conta.get('saldo'), novoSaldo)
        },
        { transacting: trx })
      .then(() => {
        return new Conta({ id: conta.id })
          .fetch({ require: true, transacting: trx });
      });
  };

  return exports;
};
