'use strict';

var debug = require('debug')('areaazul:test:helper');
var Promise = require('bluebird');
var AreaAzul = require('../areaazul');
var Fiscalizacoes = AreaAzul.collections.Fiscalizacoes;
var UsuarioFiscal = AreaAzul.models.UsuarioFiscal;
var Usuario = AreaAzul.models.Usuario;
var UsuarioAdministrativo = AreaAzul.models.UsuarioAdministrativo;
var Pessoa = AreaAzul.models.pessoa.Pessoa;
var PessoaFisica = AreaAzul.models.pessoafisica.PessoaFisica;
var PessoaJuridica = AreaAzul.models.PessoaJuridica;
var Contas = AreaAzul.collections.Contas;
var UsuarioRevendedor = AreaAzul.models.UsuarioRevendedor;
var Revendedor = AreaAzul.models.Revendedor;
var Ativacao = AreaAzul.models.Ativacao;
var Ativacoes = AreaAzul.collections.Ativacoes;
var Veiculo = AreaAzul.models.Veiculo;
var UsuarioHasVeiculos = AreaAzul.collections.UsuarioHasVeiculos;
var MovimentacaoConta = AreaAzul.models.MovimentacaoConta;
var Cidade = AreaAzul.models.Cidade;

function _apagarContasDePessoa(id) {
  if (!id) {
    return Promise.resolve(null);
  }
  return Contas
    .forge()
    .query()
    .where({
      pessoa_id: id
    })
    .delete();
}

function _apagarPessoaFisica(id) {
  if (!id) {
    return Promise.resolve(null);
  }
  return PessoaFisica
    .forge({
      pessoa_id: id
    })
    .destroy()
    .then(function() {
      return _apagarContasDePessoa(id);
    })
    .then(function() {
      return Pessoa
        .forge({
          id_pessoa: id
        })
        .destroy();
    });
}


function _apagarPessoaJuridica(id) {
  if (!id) {
    return Promise.resolve(null);
  }
  return PessoaJuridica
    .forge({
      pessoa_id: id
    })
    .destroy()
    .then(function() {
      return _apagarContasDePessoa(id);
    })
    .then(function() {
      return Pessoa
        .forge({
          id_pessoa: id
        })
        .destroy();
    });
}

function _apagarVeiculo(idVeiculo) {
  return UsuarioHasVeiculos
    .forge()
    .query()
    .where({
      veiculo_id: idVeiculo
    })
    .delete()
    .then(function() {
      return Ativacoes
        .forge()
        .query()
        .where({
          veiculo_id: idVeiculo
        })
        .delete();
    })
    .then(function() {
      return Veiculo
        .forge({
          id_veiculo: idVeiculo
        })
        .destroy();
    });
}

function _apagarRevendedor(idRevenda) {
  return UsuarioRevendedor
    .query()
    .where({ revendedor_id: idRevenda })
    .delete()
    .then(function() {
      return Revendedor
        .query()
        .where({ pessoa_id: idRevenda })
        .delete();
    })
    .then(function(revenda) {
      if (!revenda) {
        return Promise.resolve(null);
      }
      return revenda
        .destroy();
    });
}

function _apagarRevendedorJuridica(idUsuario) {
  var pessoaId = null;
  return Revendedor
    .forge({
      pessoa_id: idUsuario
    })
    .fetch()
    .then(function(revenda) {
      if (!revenda) {
        return Promise.resolve(null);
      }
      pessoaId = revenda.get('pessoa_id');
      return revenda;
    })
    .then(function() {
      return UsuarioRevendedor
        .forge({
          pessoa_id: idUsuario
        })
        .fetch()
        .then(function(usuario) {
          if (!usuario) {
            return Promise.resolve(null);
          }
          pessoaId = usuario.get('pessoa_id');
          return usuario.destroy();
        });

    })
    .then(function() {
      return _apagarRevendedor(pessoaId);
    })
    .then(function() {
      return _apagarPessoaJuridica(pessoaId);
    });

}

exports.apagarUsuarioFiscalPorCPF = function(cpf) {
  var pessoaId = null;
  return PessoaFisica
    .forge({
      cpf: cpf
    })
    .fetch()
    .then(function(pf) {
      if (pf === null) {
        return Promise.resolve(null);
      }
      pessoaId = pf.id;
      return Fiscalizacoes
        .forge({
          fiscal_id: pessoaId
        })
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
        .forge({
          pessoa_id: pessoaId
        })
        .destroy();
    })
    .then(function() {
      return _apagarPessoaFisica(pessoaId);
    });
};

exports.apagarPessoaFisicaPorCPF = function(cpf) {
  return PessoaFisica
    .forge({
      cpf: cpf
    })
    .fetch()
    .then(function(pf) {
      if (pf === null) {
        return Promise.resolve(null);
      }
      return _apagarPessoaFisica(pf.id);
    });
};

exports.apagarUsuarioPorLogin = function(login) {
  var pessoaId = null;
  return Usuario
    .forge({
      login: login
    })
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
    .forge({
      login: login
    })
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

exports.apagarRevendedorPorCPF = function(cpf) {
  if (!cpf) {
    return Promise.resolve(null);
  }
  return PessoaFisica
    .forge({
      cpf: cpf
    })
    .fetch()
    .then(function(pf) {
      if (!pf) {
        return Promise.resolve(null);
      }
      return _apagarRevendedor(pf.id);
    });
};

exports.apagarRevendedorPorCNPJ = function(cnpj) {
  if (!cnpj) {
    return Promise.resolve(null);
  }
  return PessoaJuridica
    .forge({
      cnpj: cnpj
    })
    .fetch()
    .then(function(pj) {
      if (!pj) {
        return Promise.resolve(null);
      }
      return _apagarRevendedorJuridica(pj.id);
    });
};

exports.apagarAtivacaoId = function(id) {
  var pessoaId = null;
  var usuarioId = null;
  var veiculoId = null;

  if (id === null) {
    return Promise.resolve(null);
  }
  return Ativacao
    .forge({
      id_ativacao: id
    })
    .fetch()
    .then(function(ativacao) {
      if (!ativacao) {
        return Promise.resolve(null);
      }
      pessoaId = ativacao.id;
      usuarioId = ativacao.get('usuario_id');
      veiculoId = ativacao.get('veiculo_id');
      return ativacao.destroy();
    })
    .then(function() {
      return _apagarRevendedor(usuarioId);
    });
};


exports.apagarVeiculoPorPlaca = function(placa) {
  return Veiculo
    .forge({
      placa: placa
    })
    .fetch()
    .then(function(v) {
      if (v) {
        return _apagarVeiculo(v.id);
      }
      return v;
    });
};

exports.apagarMovimentacaoConta = function(movimentacaoContaId) {
  return MovimentacaoConta
    .forge({
      id_movimentacao_conta: movimentacaoContaId
    })
    .fetch()
    .then(function(mc) {
      if (mc !== null) {
        return mc.destroy();
      }
      return Promise.resolve(null);
    });
};



exports.apagarAtivacao = function(id) {
  if (id) {
    return Ativacao
      .forge({
        id_ativacao: id
      })
      .fetch()
      .then(function(a) {

        if (a) {
          return a.destroy();
        }
        return Promise.resolve(null);
      });
  }
  return Ativacao
    .forge()
    .fetch()
    .then(function(a) {
      if (a) {
        return a.destroy();
      }
      return Promise.resolve(null);
    });

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

exports.apagarUsuarioRevenda = function(UsuarioRevendaId) {
  if (!UsuarioRevendaId) {
    return Promise.resolve(null);
  }
  return _apagarRevendedor(UsuarioRevendaId);
};

exports.pegarCidade = function() {
  return Cidade
    .forge()
    .fetch();
};

exports.pegarVeiculo = function() {
  var idCidade = null;
  return this.pegarCidade()
    .then(function(cidade) {
      idCidade = cidade.get('id_cidade');
      return cidade;
    })
    .then(function() {
      return Veiculo
        .forge({
          placa: 'placaTeste'
        })
        .fetch();
    })
    .then(function(veiculo) {
      if (veiculo) {
        return veiculo;
      }
      return Veiculo
        .cadastrar({
          cidade_id: idCidade,
          placa: 'placaTeste',
          marca: 'marcaTeste',
          modelo: 'modeloTeste',
          cor: 'corTeste',
          ano_fabricado: 2015,
          ano_modelo: 2015,
        });
    });
};

exports.pegarUsuario = function() {
  return Usuario
    .forge()
    .fetch()
    .then(function(usuario) {
      if (usuario) {
        debug('pegarUsuario() usuario existe', usuario);
        return usuario;
      }
      return Usuario.inserir({
        login: 'login',
        senha: 'senha',
        nome: 'usuario teste unitario',
        email: 'teste-unitario@areaazul.org',
        telefone: '0',
        cpf: '69425782660',
        data_nascimento: '01-04-1981',
        sexo: 'feminino',
      });
    });
};

function pegarRevendedor() {
  return Revendedor
    .forge()
    .fetch()
    .then(function(revendedor) {
      if (revendedor) {
        return revendedor;
      }
      return Revendedor
        .cadastrar({
          nome: 'nomeTeste',
          email: 'emailTeste@areaazul.org',
          telefone: 'telefoneTeste',
          cpf: '21962139425',
          data_nascimento: '31-03-1977',
          login: 'logindeteste',
          autorizacao: 'autorizacao teste',
          senha: 'senhaTeste',
          termo_servico: true,
        });
    });
}
exports.pegarRevendedor = pegarRevendedor;

exports.pegarUsuarioRevendedor = function() {
  return UsuarioRevendedor
    .forge()
    .fetch()
    .then(function(usuarioRevendedor) {
      if (usuarioRevendedor) {
        return usuarioRevendedor;
      }
      return pegarRevendedor()
        .then(function(r) {
          return UsuarioRevendedor
            .inserir({
              login: 'loginRevendaNaoExistente',
              nome: 'Revenda Teste',
              autorizacao: 'funcionario',
              senha: 'senhaRevendaNaoExistente',
              email: 'revenda@teste.com',
              cpf: '03472262214',
              data_nascimento: '28-02-1933',
              revendedor_id: r.id
            });
        });
    });
};
