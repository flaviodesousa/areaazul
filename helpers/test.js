'use strict';

var _ = require('lodash');
var debug = require('debug')('areaazul:test:helper');
var Promise = require('bluebird');
var AreaAzul = require('../areaazul');
var Bookshelf = require('bookshelf').conexaoMain;
var Fiscalizacoes = Bookshelf.collection('Fiscalizacoes');
var UsuarioFiscal = Bookshelf.model('UsuarioFiscal');
var Usuario = Bookshelf.model('Usuario');
var UsuarioAdministrativo = Bookshelf.model('UsuarioAdministrativo');
var Pessoa = Bookshelf.model('Pessoa');
var PessoaFisica = Bookshelf.model('PessoaFisica');
var PessoaJuridica = Bookshelf.model('PessoaJuridica');
var Conta = Bookshelf.model('Conta');
var UsuarioRevendedor = Bookshelf.model('UsuarioRevendedor');
var Revendedor = Bookshelf.model('Revendedor');
var Ativacao = Bookshelf.model('Ativacao');
var Ativacoes = Bookshelf.collection('Ativacoes');
var Veiculo = Bookshelf.model('Veiculo');
var UsuarioHasVeiculos = Bookshelf.collection('UsuarioHasVeiculos');
var MovimentacaoConta = Bookshelf.model('MovimentacaoConta');
var Cidade = Bookshelf.model('Cidade');

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
  return new UsuarioHasVeiculos()
    .query()
    .where({ veiculo_id: idVeiculo })
    .delete()
    .then(function() {
      return new Ativacoes()
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
  var revenda = null;
  return new UsuarioRevendedor()
    .query()
    .where({ revendedor_id: idRevenda })
    .delete()
    .then(function() {
      return new Revendedor({ id: idRevenda })
        .fetch(function(r) {
          revenda = r;
        })
        .destroy();
    })
    .then(function() {
      return _apagarConta(revenda.conta_id);
    })
    .return(revenda);
}

function _apagarRevendedorJuridica(idRevendedor) {
  return _apagarRevendedor(idRevendedor)
    .then(function(r) {
      return _apagarPessoaJuridica(r.id);
    });
}

function _apagarRevendedorFisica(idRevendedor) {
  return _apagarRevendedor(idRevendedor)
    .then(function(r) {
      return _apagarPessoaFisica(r.id);
    });
}

function _apagarUsuarioFiscal(idUsuarioFiscal) {
  return new Fiscalizacoes()
    .query()
    .where({ usuario_fiscal_id: idUsuarioFiscal })
    .delete()
    .then(function() {
      return new UsuarioFiscal({ id: idUsuarioFiscal })
        .destroy();
    })
    .then(function() {
      return _apagarPessoaFisica(idUsuarioFiscal);
    });
}

exports.apagarUsuarioFiscalPorCPF = function(cpf) {
  return new PessoaFisica({ cpf: cpf })
    .fetch()
    .then(function(pf) {
      if (pf === null) {
        return Promise.resolve(null);
      }
      return _apagarUsuarioFiscal(pf.id);
    });
};

exports.apagarPessoaFisicaPorCPF = function(cpf) {
  return new PessoaFisica({ cpf: cpf })
    .fetch()
    .then(function(pf) {
      if (pf === null) {
        return Promise.resolve(null);
      }
      return _apagarPessoaFisica(pf.id);
    });
};

function _apagarUsuario(usuario) {
  return new UsuarioHasVeiculos()
    .query()
    .where({ usario_id: usuario.id })
    .delete()
    .then(function() {
      return new Usuario({ id: usuario.id })
        .destroy();
    })
    .then(function() {
      return _apagarConta(usuario.conta_id);
    })
    .then(function() {
      return _apagarPessoaFisica(usuario.id);
    });
}

exports.apagarUsuarioPorLogin = function(login) {
  return new Usuario({ login: login })
    .fetch()
    .then(function(u) {
      if (!u) {
        return null;  // Promise.resolve(null);
      }
      return _apagarUsuario(u);
    });
};

function _apagarUsuarioAdministrativo(idUsuarioAdministrativo) {
  return new UsuarioAdministrativo({ id: idUsuarioAdministrativo })
    .destroy()
    .then(function() {
      return _apagarPessoaFisica(idUsuarioAdministrativo);
    });
}

exports.apagarUsuarioAdministrativoPorLogin = function(login) {
  return new UsuarioAdministrativo({ login: login })
    .fetch()
    .then(function(usuario) {
      if (!usuario) {
        return Promise.resolve(null);
      }
      return _apagarUsuarioAdministrativo(usuario.id);
    });
};

exports.apagarRevendedorPorCPF = function(cpf) {
  if (!cpf) {
    return Promise.resolve(null);
  }
  return new PessoaFisica({ cpf: cpf })
    .fetch()
    .then(function(pf) {
      if (!pf) {
        return Promise.resolve(null);
      }
      return _apagarRevendedorFisica(pf.id);
    });
};

exports.apagarRevendedorPorCNPJ = function(cnpj) {
  if (!cnpj) {
    return Promise.resolve(null);
  }
  return new PessoaJuridica({ cnpj: cnpj })
    .fetch()
    .then(function(pj) {
      if (!pj) {
        return Promise.resolve(null);
      }
      return _apagarRevendedorJuridica(pj.id);
    });
};

exports.apagarAtivacaoId = function(id) {
  return new Ativacao({ id: id })
    .destroy();
};

exports.apagarVeiculoPorPlaca = function(placa) {
  return new Veiculo({ placa: placa })
    .fetch()
    .then(function(v) {
      if (!v) {
        return null;
      }
      return _apagarVeiculo(v.id);
    });
};

exports.apagarMovimentacaoConta = function(movimentacaoContaId) {
  return new MovimentacaoConta({ id: movimentacaoContaId })
    .destroy();
};

exports.apagarAtivacao = function(id) {
  return new Ativacao({ id: id })
    .destroy();
};

exports.apagarUsuarioRevendaPorLogin = function(login) {
  return UsuarioRevendedor
    .forge({
      login: login
    })
    .fetch()
    .then(function(usuarioRevenda) {
      if (usuarioRevenda) {
        return usuarioRevenda.destroy();
      }
      return null;
    });
};

exports.apagarUsuarioRevenda = function(idUsuarioRevenda) {
  if (!idUsuarioRevenda) {
    return Promise.resolve(null);
  }
  return _apagarRevendedor(idUsuarioRevenda);
};

exports.pegarCidade = function() {
  return Cidade
    .forge()
    .fetch();
};

var veiculoTeste = {
  cidade_id: 1,
  placa: 'ARE4701',
  marca: 'Bentley',
  modelo: 'Sportster',
  cor: 'Azul',
  ano_fabricado: 2013,
  ano_modelo: 2015
};

exports.pegarVeiculo = function() {
  return Veiculo
    .forge({ placa: veiculoTeste.placa })
    .fetch()
    .then(function(veiculo) {
      if (veiculo) {
        return veiculo;
      }
      debug('cadastrando veiculo de teste', veiculoTeste);
      return Veiculo
        .cadastrar(veiculoTeste);
    });
};

var usuarioTeste = {
  login: 'usuarioTeste',
  senha: 'senhaTeste',
  nome: 'Nome Usuario',
  email: 'usuario-teste-unitario@areaazul.org',
  telefone: '0',
  cpf: '69425782660',
  data_nascimento: '01-04-1981',
  sexo: 'feminino'
};

exports.pegarUsuario = function pegarUsuario() {
  return new Usuario({ login: usuarioTeste.login })
    .fetch()
    .then(function(usuario) {
      if (usuario) {
        return usuario;
      }
      debug('cadastrando usuario de teste', usuarioTeste);
      return Usuario.inserir(usuarioTeste);
    });
};

var revendedorPessoaFisicaTeste = {
  nome: 'Nome Revendedor Pessoa Fisica',
  email: 'revendedor-teste-unitario@areaazul.org',
  telefone: 'telefoneTeste',
  cpf: '21962139425',
  data_nascimento: '31-03-1977',
  login: 'revendedorPessoaFisicaTeste',
  autorizacao: 'autorizacao teste',
  senha: 'senhaTeste',
  termo_servico: true
};

function pegarRevendedor() {
  return new PessoaFisica({ cpf: revendedorPessoaFisicaTeste.cpf })
    .fetch()
    .then(function(pf) {
      return new Revendedor({ id: pf.id})
        .fetch();
    })
    .then(function(revendedor) {
      if (revendedor) {
        return revendedor;
      }
      debug('cadastrando revendedor de teste', revendedorPessoaFisicaTeste);
      return Revendedor
        .cadastrar(revendedorPessoaFisicaTeste);
    });
}exports.pegarRevendedor = pegarRevendedor;

var usuarioRevendedorTeste = {
  login: 'usuarioRevendedorTeste',
  nome: 'usuário Revenda Teste',
  autorizacao: 'funcionario',
  senha: 'senhaTeste',
  email: 'usuario-revenda-teste-unitario@areaazul.org',
  cpf: '03472262214',
  data_nascimento: '28-02-1933'
};

exports.pegarUsuarioRevendedor = function() {
  return pegarRevendedor()
    .then(function(revendedor) {
      return new UsuarioRevendedor({ login: usuarioRevendedorTeste.login })
        .then(function(ur) {
          if (ur) {
            return ur;
          }
          debug('cadastrando usuario revendedor de teste',
            usuarioRevendedorTeste);
          return UsuarioRevendedor
            .inserir(
              _.merge({ revendedor_id: revendedor.id },
              usuarioRevendedorTeste));
        });
    });
};
