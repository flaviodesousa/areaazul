'use strict';

module.exports = function(AreaAzul) {
  let exports = {};

  const _ = require('lodash');
  const debug = require('debug')('areaazul-test-helper');
  const money = require('money-math');

  const aazUtils = require('areaazul-utils');

  const Bookshelf = AreaAzul._internals.Bookshelf;
  const Fiscalizacoes = Bookshelf.collection('Fiscalizacoes');
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
  const Ativacoes = Bookshelf.collection('Ativacoes');
  const Veiculo = Bookshelf.model('Veiculo');
  const UsuariosHaveVeiculos = Bookshelf.collection('UsuariosHaveVeiculos');
  const MovimentacaoConta = Bookshelf.model('MovimentacaoConta');
  const Cidade = Bookshelf.model('Cidade');

  function _apagarConta(idConta) {
    return new MovimentacaoConta()
      .query()
      .where({ conta_id: idConta })
      .delete()
      .then(function() {
        return new Conta({ id: idConta }).destroy();
      });
  }

  function _apagarPessoaFisica(id) {
    return new PessoaFisica({ id: id })
      .destroy()
      .then(function() {
        return new Pessoa({ id: id })
          .destroy();
      });
  }


  function _apagarPessoaJuridica(id) {
    return new PessoaJuridica({ id: id })
      .destroy()
      .then(function() {
        return new Pessoa({ id: id })
          .destroy();
      });
  }

  function _apagarVeiculo(idVeiculo) {
    return new UsuariosHaveVeiculos()
      .query()
      .where({ veiculo_id: idVeiculo })
      .delete()
      .then(function() {
        return AtivacaoUsuario
          .collection()
          .query()
          .whereExists(function() {
            this.select('*')
              .from('ativacao')
              .where({ veiculo_id: idVeiculo })
              .whereRaw('ativacao_id = ativacao.id');
          })
          .delete();
      })
      .then(function() {
        return AtivacaoUsuarioRevendedor
          .collection()
          .query()
          .whereExists(function() {
            this.select('*')
              .from('ativacao')
              .where({ veiculo_id: idVeiculo })
              .whereRaw('ativacao_id = ativacao.id');
          })
          .delete();
      })
      .then(function() {
        return new Ativacoes()
          .query()
          .where({ veiculo_id: idVeiculo })
          .delete();
      })
      .then(function() {
        return new Fiscalizacoes()
          .query()
          .where({ veiculo_id: idVeiculo })
          .delete();
      })
      .then(function() {
        return new Veiculo({ id: idVeiculo })
          .destroy();
      });
  }

  function _apagarRevendedor(idRevenda) {
    let idConta = null;
    return new Revendedor({ id: idRevenda })
      .fetch()
      .then(function(r) {
        if (!r) {
          return null;
        }
        idConta = r.get('conta_id');
        return new UsuarioRevendedor()
          .query()
          .where({ revendedor_id: idRevenda })
          .delete()
          .then(function() {
            return new Revendedor({ id: idRevenda })
              .destroy();
          })
          .then(function() {
            return _apagarConta(idConta);
          });
      });
  }

  function _apagarRevendedorJuridica(idRevendedor) {
    return _apagarRevendedor(idRevendedor)
      .then(function() {
        return _apagarPessoaJuridica(idRevendedor);
      });
  }

  exports.apagarPessoaJuridica = id => {
    return _apagarPessoaJuridica(id);
  };

  exports.apagarPessoaJuridicaPeloCNPJ = cnpj => {
    return new PessoaJuridica({ cnpj: cnpj })
      .fetch({ require: true })
      .then(pj => _apagarPessoaJuridica(pj.id))
      .catch(Bookshelf.NotFoundError, () => null);
  };

  function _apagarRevendedorFisica(idRevendedor) {
    return _apagarRevendedor(idRevendedor)
      .then(function() {
        return _apagarPessoaFisica(idRevendedor);
      });
  }

  function _apagarUsuarioFiscal(idUsuarioFiscal) {
    let contaId;
    return new Fiscalizacoes()
      .query()
      .where({ usuario_fiscal_id: idUsuarioFiscal })
      .delete()
      .then(function() {
        return new UsuarioFiscal({ id: idUsuarioFiscal })
          .fetch();
      })
      .then(function(usuFis) {
        if (usuFis) {
          contaId = usuFis.get('conta_id');
        }
      })
      .then(function() {
        return new UsuarioFiscal({ id: idUsuarioFiscal })
          .destroy();
      })
      .then(function() {
        return _apagarPessoaFisica(idUsuarioFiscal);
      })
      .then(function() {
        if (contaId) {
          return _apagarConta(contaId);
        }
        return null;
      });
  }

  exports.apagarUsuarioFiscalPorCPF = function(cpf) {
    return new PessoaFisica({ cpf: cpf })
      .fetch()
      .then(function(pf) {
        if (pf === null) {
          return null;
        }
        return _apagarUsuarioFiscal(pf.id);
      });
  };

  exports.apagarPessoaFisicaPorCPF = function(cpf) {
    return new PessoaFisica({ cpf: cpf })
      .fetch()
      .then(function(pf) {
        if (pf === null) {
          return null;
        }
        return _apagarPessoaFisica(pf.id);
      });
  };

  function _apagarUsuario(usuario) {
    return new UsuariosHaveVeiculos()
      .query()
      .where({ usuario_id: usuario.id })
      .delete()
      .then(function() {
        return AtivacaoUsuario
          .query()
          .where({ usuario_id: usuario.id })
          .delete();
      })
      .then(() => {
        return Ativacao
          .query()
          .where({ ativador: 'usuario', id_ativador: usuario.id })
          .delete();
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
        return _apagarPessoaFisica(idUsuarioAdministrativo);
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
      .then(veiculo => veiculo.toJSON())
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
