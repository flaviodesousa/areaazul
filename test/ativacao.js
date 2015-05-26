'use strict';

var should = require('chai').should();
var TestHelpers = require('../helpers/test');
var AreaAzul = require('../areaazul');
var Ativacao = AreaAzul.models.ativacao;
var UsuarioHasVeiculo = AreaAzul.models.UsuarioHasVeiculo;
var UsuarioRevendedor = AreaAzul.models.UsuarioRevendedor;
var PessoaFisica = AreaAzul.models.PessoaFisica;
var Veiculo = AreaAzul.models.Veiculo;
var Usuario = AreaAzul.models.Usuario;
var Estado = AreaAzul.models.Estado;

describe('model.Ativacao', function() {

  var idUsuarioComum = null;
  var idVeiculo = null;
  var idEstado = null;
  var idUsuarioRevendedor = null;
  var idPreExistenteAtivacao = null;

  var cpfPreExistente = 'revendedor-teste-pre-existente';
  var cpfNaoExistente = 'revendedor-teste-nao-existente';
  var loginRevendedorPreExistente = 'revendedor-pre-existente';
  var loginRevendedorNaoExistente = 'revendedor-nao-existente';
  var senhaRevendedorPreExistente = 'senha-revendedor-pre-existente';

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
        console.log("revenda" + revenda);
        console.log("revenda id " + revenda.get('pessoa_fisica_pessoa_id'));
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
        idUsuarioComum = user.get('pessoa_id');
      })
      .then(function() {
        console.log('Estado');
        console.log('pessoa_id'+idUsuarioComum);
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
        idEstado = estado.get('id_estado');
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
            });
          });
      })
      .then(function(veiculo) {
        idVeiculo = veiculo.get('id_veiculo');
      })
      .then(function() {
        done();
      })
      .catch(function(e) {
        console.dir(e);
        done(e);
      });
  });

  describe('Ativar()', function() {
    it('grava ativacao', function(done) {

      var ativacao = {
          usuario_pessoa_id: idUsuarioComum,
          veiculo_id: idVeiculo,
      };

      Ativacao.ativar(ativacao)
      .then(function(at) {
              should.exist(at);
              done();
            })
            .catch(function(e) {
              done(e);
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
