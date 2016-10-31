'use strict';

const debug = require('debug')('areaazul:test:veiculo');
const should = require('chai').should();

const AreaAzul = require('../areaazul');
const Veiculo = AreaAzul.facade.Veiculo;

const TestHelpers = require('areaazul-test-helpers')(AreaAzul);
const AreaAzulUtils = require('areaazul-utils');

describe('facade Veiculo', function() {
  function apagarDadosDeTeste(placa) {
    return TestHelpers.apagarVeiculoPorPlaca(placa);
  }

  const placaInexistente = 'VEI-1373';
  const placaTeste = 'AAA-1234';
  const tipoTeste = 'carro';
  const placaTesteSemMascara = AreaAzulUtils.placaSemMascara(placaTeste);
  const marcaTeste = 'Marca teste';
  const modeloTeste = 'Modelo Teste';
  const corTeste = 'Cor Teste';
  const anoFabricadoTeste = '2015';
  const anoModeloTeste = '2015';

  var idCidade = null;
  var idVeiculo = null;
  var idUsuarioComum = null;

  before(function() {
    return TestHelpers.pegarCidade()
      .then(function(cidade) {
        debug('Usando cidade ' + cidade.id);
        idCidade = cidade.id;
      })
      .then(function() {
        return TestHelpers.pegarUsuario();
      })
      .then(function(usuario) {
        debug('Usando usuario ' + usuario.id);
        idUsuarioComum = usuario.id;
      })
      .then(function() {
        return apagarDadosDeTeste(placaTeste);
      })
      .then(function() {
        return apagarDadosDeTeste(placaInexistente);
      });
  });

  describe('cadastrar()', function() {
    it('falha gravar veiculo sem placa', function(done) {
      var novoVeiculo = {
        usuario_id: idUsuarioComum,
        cidade_id: idCidade,
        // Falta: placa: placaTeste,
        tipo: tipoTeste,
        marca: marcaTeste,
        modelo: modeloTeste,
        cor: corTeste,
        ano_fabricado: anoFabricadoTeste,
        ano_modelo: anoModeloTeste
      };
      Veiculo
        .cadastrar(novoVeiculo)
        .then(function() {
          return done(new Error('Não deveria aceitar veículo inválido'));
        })
        .catch(AreaAzul.BusinessException, (be) => {
          should.exist(be);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('falha gravar veiculo sem cidade', function(done) {
      var novoVeiculo = {
        usuario_id: idUsuarioComum,
        // Falta: cidade_id: idCidade,
        placa: placaTeste,
        tipo: tipoTeste,
        marca: marcaTeste,
        modelo: modeloTeste,
        cor: corTeste,
        ano_fabricado: anoFabricadoTeste,
        ano_modelo: anoModeloTeste
      };
      Veiculo
        .cadastrar(novoVeiculo)
        .then(function() {
          return done(new Error('Não deveria aceitar veículo inválido'));
        })
        .catch(AreaAzul.BusinessException, (be) => {
          should.exist(be);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('falha gravar veiculo com cidade inválida', function(done) {
      var novoVeiculo = {
        usuario_id: idUsuarioComum,
        cidade_id: 0,
        placa: placaTeste,
        tipo: tipoTeste,
        marca: marcaTeste,
        modelo: modeloTeste,
        cor: corTeste,
        ano_fabricado: anoFabricadoTeste,
        ano_modelo: anoModeloTeste
      };
      Veiculo
        .cadastrar(novoVeiculo)
        .then(function() {
          return done(new Error('Não deveria aceitar veículo inválido'));
        })
        .catch(AreaAzul.BusinessException, (be) => {
          should.exist(be);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('falha gravar veiculo com placa inválida (+3 letras)', function(done) {
      var novoVeiculo = {
        usuario_id: idUsuarioComum,
        cidade_id: idCidade,
        placa: placaTeste + 'A',
        tipo: tipoTeste,
        marca: marcaTeste,
        modelo: modeloTeste,
        cor: corTeste,
        ano_fabricado: anoFabricadoTeste,
        ano_modelo: anoModeloTeste
      };
      Veiculo
        .cadastrar(novoVeiculo)
        .then(function() {
          return done(new Error('Não deveria aceitar veículo inválido'));
        })
        .catch(AreaAzul.BusinessException, (be) => {
          should.exist(be);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('falha gravar veiculo com placa inválida (+3 letras)', function(done) {
      var novoVeiculo = {
        usuario_id: idUsuarioComum,
        cidade_id: idCidade,
        placa: 'AAAA111',
        tipo: tipoTeste,
        marca: marcaTeste,
        modelo: modeloTeste,
        cor: corTeste,
        ano_fabricado: anoFabricadoTeste,
        ano_modelo: anoModeloTeste
      };
      Veiculo
        .cadastrar(novoVeiculo)
        .then(function() {
          return done(new Error('Não deveria aceitar veículo inválido'));
        })
        .catch(AreaAzul.BusinessException, (be) => {
          should.exist(be);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('falha gravar veiculo com placa inválida (+4 números)', function(done) {
      var novoVeiculo = {
        usuario_id: idUsuarioComum,
        cidade_id: idCidade,
        placa: 'AB32123',
        tipo: tipoTeste,
        marca: marcaTeste,
        modelo: modeloTeste,
        cor: corTeste,
        ano_fabricado: anoFabricadoTeste,
        ano_modelo: anoModeloTeste
      };
      Veiculo
        .cadastrar(novoVeiculo)
        .then(function() {
          return done(new Error('Não deveria aceitar veículo inválido'));
        })
        .catch(AreaAzul.BusinessException, (be) => {
          should.exist(be);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('falha gravar veiculo com placa inválida (len>7)', function(done) {
      var novoVeiculo = {
        usuario_id: idUsuarioComum,
        cidade_id: idCidade,
        placa: 'ABC12345',
        tipo: tipoTeste,
        marca: marcaTeste,
        modelo: modeloTeste,
        cor: corTeste,
        ano_fabricado: anoFabricadoTeste,
        ano_modelo: anoModeloTeste
      };
      Veiculo
        .cadastrar(novoVeiculo)
        .then(function() {
          return done(new Error('Não deveria aceitar veículo inválido'));
        })
        .catch(AreaAzul.BusinessException, (be) => {
          should.exist(be);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('falha gravar veiculo com placa inválida (len<7)', function(done) {
      var novoVeiculo = {
        usuario_id: idUsuarioComum,
        cidade_id: idCidade,
        placa: 'ABC123',
        tipo: tipoTeste,
        marca: marcaTeste,
        modelo: modeloTeste,
        cor: corTeste,
        ano_fabricado: anoFabricadoTeste,
        ano_modelo: anoModeloTeste
      };
      Veiculo
        .cadastrar(novoVeiculo)
        .then(function() {
          return done(new Error('Não deveria aceitar veículo inválido'));
        })
        .catch(AreaAzul.BusinessException, (be) => {
          should.exist(be);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('falha gravar veiculo sem tipo', function(done) {
      var novoVeiculo = {
        usuario_id: idUsuarioComum,
        cidade_id: idCidade,
        placa: placaTeste,
        // Falta tipo: tipoTeste,
        marca: marcaTeste,
        modelo: modeloTeste,
        cor: corTeste,
        ano_fabricado: anoFabricadoTeste,
        ano_modelo: anoModeloTeste
      };
      Veiculo
        .cadastrar(novoVeiculo)
        .then(function() {
          return done(new Error('Não deveria aceitar veículo inválido'));
        })
        .catch(AreaAzul.BusinessException, (be) => {
          should.exist(be);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('falha gravar veiculo com tipo inválido', function(done) {
      var novoVeiculo = {
        usuario_id: idUsuarioComum,
        cidade_id: idCidade,
        placa: placaTeste,
        tipo: 'caminhonete',  // Deveria ser 'camionete'
        marca: marcaTeste,
        modelo: modeloTeste,
        cor: corTeste,
        ano_fabricado: anoFabricadoTeste,
        ano_modelo: anoModeloTeste
      };
      Veiculo
        .cadastrar(novoVeiculo)
        .then(function() {
          return done(new Error('Não deveria aceitar veículo inválido'));
        })
        .catch(AreaAzul.BusinessException, (be) => {
          should.exist(be);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('falha gravar veiculo sem modelo/marca/cor', function(done) {
      var novoVeiculo = {
        usuario_id: idUsuarioComum,
        cidade_id: idCidade,
        placa: placaTeste,
        tipo: tipoTeste,
        // Falta: marca: marcaTeste,
        // Falta: modelo: modeloTeste,
        // Falta: cor: corTeste,
        ano_fabricado: anoFabricadoTeste,
        ano_modelo: anoModeloTeste
      };
      Veiculo
        .cadastrar(novoVeiculo)
        .then(function() {
          return done(new Error('Não deveria aceitar veículo inválido'));
        })
        .catch(AreaAzul.BusinessException, (be) => {
          should.exist(be);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('grava veiculo', function(done) {
      var novoVeiculo = {
        usuario_id: idUsuarioComum,
        cidade_id: idCidade,
        placa: placaTeste,
        tipo: tipoTeste,
        marca: marcaTeste,
        modelo: modeloTeste,
        cor: corTeste,
        ano_fabricado: anoFabricadoTeste,
        ano_modelo: anoModeloTeste
      };
      Veiculo
        .cadastrar(novoVeiculo)
        .then(function(veiculo) {
          should.exist(veiculo);
          veiculo.should.have.property('id');
          veiculo.should.have.property('placa', placaTesteSemMascara);
          veiculo.should.have.property('cidade');
          idVeiculo = veiculo.id;
          return done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });


  describe('buscarPorPlaca()', function() {
    it('retorna um veiculo', function(done) {
      Veiculo.buscarPorPlaca(placaTeste)
        .then(function(veiculo) {
          should.exist(veiculo);
          veiculo.should.have.property('id', idVeiculo);
          veiculo.should.have.property('placa', placaTesteSemMascara);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
    it('retorna indefinido se placa não cadastrada', function(done) {
      Veiculo.buscarPorPlaca(placaInexistente)
        .then(function(veiculo) {
          should.not.exist(veiculo);
          done();
        })
        .catch(function(e) {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

  describe('listar()', function() {
    it('retorna uma lista de veiculos ', function(done) {
      Veiculo
        .listar()
        .then(veiculos => {
          should.exist(veiculos);
          veiculos.should.have.property('ativos');
          veiculos.should.have.property('expirando');
          veiculos.should.have.property('expirados');
          done();
        })
        .catch(e => {
          debug('erro inesperado', e);
          done(e);
        });
    });
  });

});
