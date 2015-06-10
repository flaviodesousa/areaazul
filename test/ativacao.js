'use strict';

var should = require('chai').should();
var TestHelpers = require('../helpers/test');
var AreaAzul = require('../areaazul');
var Ativacao = AreaAzul.models.ativacao;
var UsuarioRevendedor = AreaAzul.models.UsuarioRevendedor;
var Veiculo = AreaAzul.models.Veiculo;
var Usuario = AreaAzul.models.Usuario;
var Estado = AreaAzul.models.Estado;

describe('model.Ativacao', function() {

  var idUsuarioComum = null;
  var idVeiculo = null;
  var idEstado = null;
  var idUsuarioRevendedor = null;
  var idPreExistenteAtivacao = null;
  var idAtivacao = null;

  var cpfNaoExistente = 'revendedor-teste-nao-existente';
  var loginRevendedorNaoExistente = 'revendedor-nao-existente';

  var loginUsuarioComPreExistente = 'usuario-pre-existente';
  var cpfUsuarioComumPreExistente = 'usuario-comum-test';

  var estadoTeste = null;
  var placaTeste = 'AAA1234';
  var marcaTeste = 'Marca teste';
  var modeloTeste = 'Modelo Teste';
  var corTeste = 'Cor Teste';
  var anoFabricadoTeste = '2015';
  var anoModeloTeste = '2015';

  var estadoTesteNome = 'Estado';
  var estadoTesteUf = 'UF';

  function apagarDadosDeTeste() {
    return TestHelpers.apagarAtivacaoId(idPreExistenteAtivacao);
  }

  before(function(done) {
    var usuario;
    apagarDadosDeTeste()
      .then(function() {
        return UsuarioRevendedor
          .forge({login: loginRevendedorNaoExistente})
          .fetch()
          .then(function(ur) {
            if (ur) { return ur; }
            return UsuarioRevendedor.cadastrar({
                login: loginRevendedorNaoExistente,
                nome: 'Revendedor Teste',
                email: 'revendedor-teste@example.com',
                cpf: cpfNaoExistente,
                autorizacao: 'funcionario',
              });
          });
      })
      .then(function(revenda) {
        idUsuarioRevendedor = revenda.get('pessoa_fisica_pessoa_id');
      })
      .then(function() {
        return Usuario
          .forge({login: loginUsuarioComPreExistente})
          .fetch()
          .then(function(u) {
            if (u) { return u; }
            return Usuario.cadastrar({
              login: loginUsuarioComPreExistente,
              nome: 'Usuario Teste',
              email: 'usuario-teste@example.com',
              cpf: cpfUsuarioComumPreExistente,
            });
          });
      })
      .then(function(user) {
        usuario = user;
        idUsuarioComum = user.id;
      })
      .then(function() {
        return Estado
          .forge({uf: estadoTesteUf})
          .fetch()
          .then(function(e) {
            if (e) { return e; }
            return Estado.cadastrar({
                nome: estadoTesteNome,
                uf: estadoTesteUf,
              });
          });
      })
      .then(function(estado) {
        idEstado = estado.id;
      })
      .then(function() {
        return Veiculo
          .forge({placa: placaTeste})
          .fetch()
          .then(function(v) {
            if (v) { return v; }
            return Veiculo.cadastrar({
              estado_id: estadoTeste,
              placa: placaTeste,
              marca: marcaTeste,
              modelo: modeloTeste,
              cor: corTeste,
              ano_fabricado: anoFabricadoTeste,
              ano_modelo: anoModeloTeste,
              usuario_id: idUsuarioComum,
            }, usuario);
          });
      })
      .then(function(veiculo) {
        idVeiculo = veiculo.id;
      })
      .then(function() {
        done();
      })
      .catch(function(e) {
        done(e);
      });
  });

  describe('Ativar()', function() {
    it('grava ativacao', function(done) {
      var ativacao = {
        usuario_pessoa_id: idUsuarioComum,
        veiculo_id: idVeiculo,
      };

      Ativacao
        .ativar(ativacao)
        .then(function(at) {
          should.exist(at);
          idAtivacao = at.id;
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });

  describe('desativar()', function() {
    it('falha para ativacao inexistente', function(done) {
      Ativacao
        .desativar({
          id_ativacao: 0,
          usuario_pessoa_id: idUsuarioComum,
        })
        .then(function() {
          done('Nao deveria ter desativado uma ativacao inexistente');
        })
        .catch(function(e) {
          should.exist(e);
          console.dir(e);
          done();
        });
    });
    it('falha se usuario diferente do ativador', function(done) {
      Ativacao
        .desativar({
          id_ativacao: idAtivacao,
          usuario_pessoa_id: 0,
        })
        .then(function() {
          done('Nao deveria ter desativado com usuario diferente');
        })
        .catch(function(e) {
          should.exist(e);
          console.dir(e);
          done();
        });
    });
    it('desativa ativacao existente', function(done) {
      Ativacao
        .desativar({
          id_ativacao: idAtivacao,
          usuario_pessoa_id: idUsuarioComum,
        })
        .then(function() {
          done();
        })
        .catch(function(e) {
          done(e);
        });
    });
  });

  describe('ativarPelaRevenda()', function() {
    it('grava ativacao', function(done) {


      console.log('idUsuarioComum: ' + idUsuarioComum);
      console.log('idVeiculo: ' + idVeiculo);
      console.log('idUsuarioRevendedor: ' + idUsuarioRevendedor);
      Ativacao
        .ativarPelaRevenda({
          usuario_pessoa_id: idUsuarioComum,
          veiculo_id: idVeiculo,
          revendedor_id: idUsuarioRevendedor,
        },
        function(model) {
          should.exist(model);
          done();
        },
        function(err) {
          done(err);
        });
    });
  });

  after(function(done) {
    apagarDadosDeTeste()
      .then(function() {
        done();
      })
      .catch(function(e) {
        done(e);
      });
  });
});
