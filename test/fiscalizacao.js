var AreaAzul = require('../areaazul');
var should = require('should');

var Fiscalizacao = AreaAzul.models.Fiscalizacao;
var Fiscalizacoes = AreaAzul.models.Fiscalizacoes;
var UsuarioFiscal = AreaAzul.models.UsuarioFiscal;
var UsuariosFiscais = AreaAzul.collections.UsuariosFiscais;

describe('model.fiscalizacao', function () {
  var fiscal = null;
  var fiscalCriado = false;

  UsuariosFiscais.forge().fetchOne()
    .then(function (f) {
      if (f) {
        fiscal = f;
        fiscalCriado = false;
      } else {
        UsuarioFiscal.cadastrar({
          login: 'fiscal-teste',
          nome: 'Fiscal Teste',
          email: 'fiscal-teste@example.com',
          telefone: '0',
          cpf: 'teste',
          data_nascimento: '13/04/1983',
          sexo: 'feminino'
        }, function (f) {
          fiscal = f;
          fiscalCriado = true;
        }, function (e) {
        	fiscal = null;
        });
      }
    })
    .thenReturn();

  describe('cadastrar()', function () {
    it('nao grava sem placa', function (done) {
      var f = {
        latitude: 33.5,
        longitude: 44.5,
        fiscal_id: fiscal.pessoa_id
      };
      Fiscalizacao.cadastrar(f,
        function (model) {
          done('Should not have saved! model='+model);
        },
        function (err) {
          done();
        });
    });
    it('grava com placa', function (done) {
      var f = {
        placa: 'xyz1234',
        latitude: 33.5,
        longitude: 34.5
      };
      Fiscalizacao.cadastrar(f,
        function (model) {
          done();
        },
        function (err) {
          done(err);
        });
    });
    it('nao deve aceitar virgula decimal', function (done) {
      var f = {
        placa: 'xyz1234',
        latitude: '33,5',
        longitude: '34,5'
      };
      Fiscalizacao.cadastrar(f,
        function (model) {
          done('Should not have saved!')
        },
        function (err) {
          done();
        });
    });
    it("lat/lon devem ter ate' 10 casas decimais", function (done) {
      var f = {
        placa: 'lon9999',
        latitude: '-89.9999999999',
        longitude: '-179.9999999999'
      };
      Fiscalizacao.cadastrar(f,
        function (model) {
          model.attributes.latitude
            .should.be.exactly('-89.9999999999', 'Latitude');
          model.attributes.longitude
            .should.be.exactly('-179.9999999999', 'Longitude');
          done();
        },
        function (err) {
          done(err);
        })
    });
  });
  describe('listar()', function () {
    it('retorna uma lista de fiscalizacoes', function (done) {
      Fiscalizacao.listar(undefined,
        function (collection) {
          collection.toJSON({shallow: true})
            .should.be.Array
            .and.not.empty;
          done();
        },
        function (err) {
          done(err);
        });
    });
  });
});