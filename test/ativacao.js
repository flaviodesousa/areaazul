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
  var idUsuarioComun = null;
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
  var cpfUsuarioComumPreExistente = 'usuario-comun-test';
  var senhaUsuarioComunPreExixtente = 'senha-usuario-comun';

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
        return UsuarioRevendedor.cadastrar({
            login: loginRevendedorNaoExistente,
            nome: 'Revendedor Teste',
            email: 'revendedor-teste@example.com',
            cpf: cpfNaoExistente,
            autorizacao: 'funcionario',
          });
      })
      .then(function(revenda) {
        console.log("revenda" + revenda);
        console.log("revenda id " + revenda.get('pessoa_fisica_pessoa_id'));
        idUsuarioRevendedor = revenda.get('pessoa_fisica_pessoa_id');
      })
      .then(function() {
        return Usuario.cadastrar({
          login: loginUsuarioComPreExistente,
          nome: 'Usuario Teste',
          email: 'usuario-teste@example.com',
          cpf: cpfUsuarioComumPreExistente,
        });
      })
      .then(function(user) {
        idUsuarioComun = user.get('pessoa_id');
      })
      .then(function() {
        return Estado.cadastrar({
            nome: estadoTesteNome,
            uf: estadoTesteUf,
          });
      })
      .then(function(estado) {
        idEstado = estado.get('id_estado');
      })
      .then(function() {
        return Veiculo.cadastrar({
          estado_id: estadoTeste,
          placa: placaTeste,
          marca: marcaTeste,
          modelo: modeloTeste,
          cor: corTeste,
          ano_fabricado: anoFabricadoTeste,
          ano_modelo: anoModeloTeste,
          usuario_id: idUsuarioComun
        });
      })
      .then(function(veiculo) {
        idVeiculo = veiculo.get('id_veiculo');
      })
      .then(function() {
        done();
      })
      .catch(function(e) {
        done(e);
      });
  });

  describe('Ativar()', function() {
    it.skip('grava ativacao', function(done) {
      var ativacao = {
        usuario_pessoa_id: idUsuarioComun,
        veiculo_id: idVeiculo,
      };

      Ativacao.ativar(ativacao,
        function() {
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
