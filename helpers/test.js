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
var UsuarioRevendedor = AreaAzul.models.UsuarioRevendedor;
var Revendedor = AreaAzul.models.revendedor;
var Ativacao = AreaAzul.models.ativacao;
var UsuarioHasVeiculo = AreaAzul.models.UsuarioHasVeiculo;
var Veiculo = AreaAzul.models.veiculo;

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

function _apagarVeiculo(id_veiculo){
  if(!id_veiculo){
    return Promise.resolve(null);
  }
  return Veiculo
          .forge({id_veiculo: id_veiculo})
          .then(function(veiculo){
            return veiculo.destroy();
  });
}



function _apagarRevendedor(id_revenda){

  var pessoaId = null;
  
  return Revendedor
    .forge({id_revendedor: id_revenda})
    .fetch()
    .then(function(revenda) {
      if (!revenda) {
        return Promise.resolve(null);
      }
      pessoaId = revenda.id;
      return revenda
        .destroy();
    });
}


function _apagarUsuario(id_usuario){
    var pessoaId = null;
    return Usuario
      .forge({pessoa_fisica_pessoa_id: id_usuario})
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


function _apagarUsuarioHasVeiculo(id_usuario, id_veiculo){
  var usuarioId = null;
  var veiculoId = null;

  if (!id_usuario || !id_veiculo) {
    return Promise.resolve(null);
  }

  return UsuarioHasVeiculo
        .forge({usuario_pessoa_id: id_usuario, veiculo_id: id_veiculo})
        .destroy()
        .then(function(usuariohasveiculo){
          if (!usuariohasveiculo) {
              return Promise.resolve(null);
          }

          usuarioId = usuariohasveiculo.usuarioId;
          veiculoId = usuariohasveiculo.veiculoId;      
  })
  .then(function(){
      return _apagarVeiculo(veiculoId);
  })
  .then(function(){
      return _apagarUsuario(usuarioId);
  });

}

function _apagarUsuarioRevenda(id_usuario){
    var pessoaId = null;
    var revendedorId = null;
    return UsuarioRevendedor
      .forge({pessoa_fisica_pessoa_id: id_usuario})
      .fetch()
      .then(function(usuario) {
        if (!usuario) {
          return Promise.resolve(null);
        }
        pessoaId = usuario.id;
        revendedorId = usuario.revendedor_id;

        return usuario
          .destroy();
      })
      .then(function(){
        return _apagarRevendedor(revendedorId);
      })
      .then(function() {
        return _apagarPessoaFisica(pessoaId);
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

exports.apagarPessoaFisicaPorCPF = function(cpf) {
  return PessoaFisica
    .forge({cpf: cpf})
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

exports.apagarAtivacaoId = function(id) {
  var pessoaId = null;
  var usuarioId = null;
  var veiculoId = null;

  if (!id) {
    return Promise.resolve(null);
  }
  return Ativacao
    .forge({id_ativacao: id})
    .then(function(ativacao) {
      if (!ativacao) {
        return Promise.resolve(null);
      }
      pessoaId = ativacao.id;
      usuarioId = ativacao.usuario_id;
      veiculoId = ativacao.veiculo_id;
      return ativacao.destroy();
  }).then(function(){
      return _apagarUsuarioHasVeiculo(usuarioId, veiculoId);
  }).then(function(){
      return _apagarUsuarioRevenda(usuarioId);
  });

}



