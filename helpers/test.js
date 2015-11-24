'use strict';

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
var Ativacao = AreaAzul.models.ativacao;
var Ativacoes = AreaAzul.collections.Ativacoes;
var UsuarioHasVeiculo = AreaAzul.models.UsuarioHasVeiculo;
var Veiculo = AreaAzul.models.Veiculo;
var UsuarioHasVeiculos = AreaAzul.collections.UsuarioHasVeiculos;
var MovimentacaoConta = AreaAzul.models.MovimentacaoConta;
var Cidade = AreaAzul.models.Cidade;
var Estado = AreaAzul.models.Estado;

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
        .delete()
        .thenReturn();
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
    var pessoaId = null;

    return Revendedor
        .forge({
            pessoa_id: idRevenda
        })
        .fetch()
        .then(function(revenda) {
            if (!revenda) {
                return Promise.resolve(null);
            }
            pessoaId = revenda.get("pessoa_id");
            return revenda
                .destroy();
        });
}


function _apagarUsuario(idUsuario) {
    var pessoaId = null;
    return Usuario
        .forge({
            pessoa_id: idUsuario
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
}


function _apagarUsuarioHasVeiculo(idUsuario, idVeiculo) {
    var usuarioId = null;
    var veiculoId = null;

    if (!idUsuario || !idVeiculo) {
        return Promise.resolve(null);
    }

    return UsuarioHasVeiculo
        .forge({
            usuario_pessoa_id: idUsuario,
            veiculo_id: idVeiculo
        })
        .fetch()
        .then(function(usuariohasveiculo) {
            if (!usuariohasveiculo) {
                return Promise.resolve(null);
            }

            usuarioId = usuariohasveiculo.get('usuario_pessoa_id');
            veiculoId = usuariohasveiculo.get('veiculo_id');
            return usuariohasveiculo.destroy();

        })
        .then(function() {
            return _apagarVeiculo(veiculoId);
        })
        .then(function() {
            return _apagarUsuario(usuarioId);
        });

}

function _apagarUsuarioRevenda(idUsuario) {
    var pessoaId = null;
    var revendedorId = null;
    return UsuarioRevendedor
        .forge({
            pessoa_fisica_pessoa_id: idUsuario
        })
        .fetch()
        .then(function(usuario) {
            if (!usuario) {
                return Promise.resolve(null);
            }
            pessoaId = usuario.get('pessoa_fisica_pessoa_id');
            revendedorId = usuario.get('revendedor_id');
            return usuario;

        })
        .then(function(usuario) {
            console.log("usuario");
            console.dir(usuario);
            return usuario.destroy();
        })
        .then(function() {
            return _apagarRevendedor(revendedorId);
        })
        .then(function() {
            return _apagarPessoaFisica(pessoaId);
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
                    pessoa_fisica_pessoa_id: idUsuario
                })
                .fetch()
                .then(function(usuario) {
                    if (!usuario) {
                        return Promise.resolve(null);
                    }
                    pessoaId = usuario.get('pessoa_fisica_pessoa_id');
                    revendedorId = usuario.get('revendedor_id');
                    return usuario.destroy;
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

exports.apagarRevendedorPessoPorIdentificador = function(cpf, cnpj) {
    var pessoaId = null;
    if (cpf !== null || cnpj !== null) {
        console.log("cpf" + cpf);
        return PessoaFisica
            .forge({
                cpf: cpf
            })
            .fetch()
            .then(function(pf) {
                if (pf === null) {
                    return Promise.resolve(null);
                }
                return pf;
            })
            .then(function(pf) {
                if (pf === null) {
                    return Promise.resolve(null);
                }
                return _apagarUsuarioRevenda(pf.get('pessoa_id'));
            })
            .then(function() {
                return PessoaJuridica
                    .forge({
                        cnpj: cnpj
                    })
                    .fetch()
                    .then(function(pj) {
                        console.log("pj");
                        console.dir(pj);
                        if (pj === null) {
                            return Promise.resolve(null);
                        }
                        return pj;
                    })
                    .then(function(pj) {
                        if (pj === null) {
                            return Promise.resolve(null);
                        }
                        console.log("pj");
                        console.dir(pj);
                        return _apagarRevendedorJuridica(pj.get('pessoa_id'));
                    });
            })
    }

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
            return _apagarUsuarioRevenda(usuarioId);
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

exports.apagarUsuarioRevenda = function(UsuarioRevendaId) {
    if (!UsuarioRevendaId) {
        return Promise.resolve(null);
    } else {
        return _apagarUsuarioRevenda(UsuarioRevendaId);
    }
};

exports.pegarCidade = function() {
    return Cidade.forge().fetch();
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
        .forge({placa: 'placaTeste'})
        .fetch();
    })
    .then(function(veiculo) {
      if (veiculo) {
        return veiculo;
      } else {
        return Veiculo
          ._cadastrar({
                cidade_id: idCidade,
                placa: 'placaTeste',
                marca: 'marcaTeste',
                modelo: 'modeloTeste',
                cor: 'corTeste',
                ano_fabricado: 2015,
                ano_modelo: 2015,
            });
      }
    });
};

exports.pegarUsuario = function() {
    return Usuario
        .forge()
        .fetch()
        .then(function(usuario) {
            if (usuario) {
                return usuario;
            } else {
                return Usuario.cadastrar({
                    login: 'login',
                    senha: 'senha',
                    nome: 'usuario teste unitario',
                    email: 'teste-unitario@areaazul.org',
                    telefone: '0',
                    cpf: '0',
                    data_nascimento: new Date(1981, 4, 1),
                    sexo: 'feminino',
                }).then(function(usuario) {
                    return usuario;
                })
            }
        });
};

exports.pegarUsuarioRevendedor = function() {
    return UsuarioRevendedor
        .forge()
        .fetch()
        .then(function(usuario_revendedor) {
            if (usuario_revendedor) {
                return usuario_revendedor;
            }
        });
};
