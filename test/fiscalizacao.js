var should = require('should');

var AreaAzul = require('../areaazul');
var Fiscalizacao = AreaAzul.models.Fiscalizacao;
var Fiscalizacoes = AreaAzul.collections.Fiscalizacoes;
var UsuarioFiscal = AreaAzul.models.UsuarioFiscal;
var UsuariosFiscais = AreaAzul.collections.UsuariosFiscais;

describe('model.fiscalizacao', function () {
  var fiscal_id = null;
  var fiscalCriado = false;

  before(function (done) {
    UsuariosFiscais
      .forge()
      .fetchOne()
      .then(function (f) {
        if (f) {
          fiscal_id = f.get('pessoa_id');
          fiscalCriado = false;
          done();
        } else {
          UsuarioFiscal.cadastrar({
            login: 'fiscal-teste',
            nome: 'Fiscal Teste',
            email: 'fiscal-teste@example.com',
            telefone: '0',
            cpf: 'teste-fiscalizacao',
          })
          .then(function (f) {
            fiscal_id = f.get('pessoa_id');
            fiscalCriado = true;
            done();
          })
          .catch(function (e) {
            done(e);
          });
        }
      });
  });

  describe('cadastrar()', function () {

    it('nao grava sem placa', function (done) {
      Fiscalizacao.cadastrar({
        latitude: 33.5,
        longitude: 44.5,
        fiscal_id: fiscal_id
      }, function (model) {
        done(new Error('Nao deveria ter gravado sem placa. id_fiscalizacao=' + model.get('id')));
      }, function () {
        done();
      });
    });

    it('nao grava sem fiscal', function (done) {
      Fiscalizacao.cadastrar({
        placa: 'xyz1234',
        latitude: 33.5,
        longitude: 34.5,
      }, function (model) {
        done(new Error('Nao deveria ter gravado sem fiscal_id valido. id_fiscalizacao=' + model.get('id')));
      }, function () {
        done();
      });
    });

    it('grava com placa e fiscal', function (done) {
      Fiscalizacao.cadastrar({
        placa: 'xyz1234',
        latitude: 33.5,
        longitude: 34.5,
        fiscal_id: fiscal_id
      }, function () {
        done();
      }, function (err) {
        done(err);
      });
    });

    it('nao deve aceitar virgula decimal', function (done) {
      Fiscalizacao.cadastrar({
        placa: 'xyz1234',
        latitude: '33,5',
        longitude: '34,5',
        fiscal_id: fiscal_id
      }, function (model) {
        done(new Error('Nao deveria ter gravado com virgula decimal. id_fiscalizacao=' + model.get('id')));
      }, function () {
        done();
      });
    });

    it("lat/lon devem ter ate' 10 casas decimais", function (done) {
      Fiscalizacao.cadastrar({
        placa: 'lon9999',
        latitude: '-89.9999999999',
        longitude: '-179.9999999999',
        fiscal_id: fiscal_id
      }, function (model) {
        model.attributes.latitude
          .should.be.exactly('-89.9999999999', 'Latitude');
        model.attributes.longitude
          .should.be.exactly('-179.9999999999', 'Longitude');
        done();
      }, function (err) {
        done(err);
      });
    });

  });

  describe('listar()', function () {
    it('retorna uma lista de fiscalizacoes', function (done) {
      Fiscalizacoes.listar(undefined,
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

  after(function (done) {
    if (!fiscalCriado) {
      done(); // nada a fazer...
    } else {
      Fiscalizacao
        .where('fiscal_id', fiscal_id)
        .destroy()
        .then(function () {
          UsuarioFiscal
            .forge({pessoa_id: fiscal_id})
            .destroy();
        })
        .then(function () {
          done();
        })
        .catch(function (err) {
          done(err);
        });
    }
  });
});
