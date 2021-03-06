'use strict';

const debug = require('debug')('areaazul:test:veiculo');
const should = require('chai')
  .should();

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul._internals.Bookshelf;
const Veiculo = AreaAzul.facade.Veiculo;

const TestHelpers = require('../../test-helpers')(AreaAzul);
const AreaAzulUtils = require('areaazul-utils');

describe('facade Veiculo', function() {
  function apagarDadosDeTeste(placa, trx) {
    return TestHelpers.apagarVeiculoPorPlaca(placa, trx);
  }

  const placaInexistente = 'VEI1373';
  const placaTeste = 'AAA1234';
  const tipoTeste = 'carro';
  const placaTesteSemMascara = AreaAzulUtils.placaSemMascara(placaTeste);
  const marcaTeste = 'Marca teste';
  const modeloTeste = 'Modelo Teste';
  const corTeste = 'Cor Teste';
  const anoFabricadoTeste = '2015';
  const anoModeloTeste = '2015';

  let idCidade = null;
  let idVeiculo = null;
  let idUsuarioComum = null;

  before(function() {
    return Bookshelf.transaction(trx =>
      TestHelpers.pegarCidade(trx)
        .then(function(cidade) {
          debug('Usando cidade ' + cidade.id);
          idCidade = cidade.id;
        })
        .then(function() {
          return TestHelpers.pegarUsuario(trx);
        })
        .then(function(usuario) {
          debug('Usando usuario ' + usuario.id);
          idUsuarioComum = usuario.id;
        })
        .then(function() {
          return apagarDadosDeTeste(placaTeste, trx);
        })
        .then(function() {
          return apagarDadosDeTeste(placaInexistente, trx);
        }));
  });

  describe('cadastrar()', function() {
    it('falha gravar veiculo sem placa', function(done) {
      const novoVeiculo = {
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
      const novoVeiculo = {
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
      const novoVeiculo = {
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
    it('falha gravar veiculo com placa inválida (len<7 caracteres)', function(done) {
      const novoVeiculo = {
        usuario_id: idUsuarioComum,
        cidade_id: idCidade,
        placa: 'AAA123',
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
    it('falha gravar veiculo com placa inválida (+4 letras)', function(done) {
      const novoVeiculo = {
        usuario_id: idUsuarioComum,
        cidade_id: idCidade,
        placa: 'AAAAA11',
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
    it('falha gravar veiculo com placa inválida (-2 números)', function(done) {
      const novoVeiculo = {
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
    it('falha gravar veiculo com placa inválida (nem DENATRAN nem Mercosul)', function(done) {
      const novoVeiculo = {
        usuario_id: idUsuarioComum,
        cidade_id: idCidade,
        placa: 'AB1234C', // No padrão DENATRAN as 3 letras vem no começo
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
      const novoVeiculo = {
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
      const novoVeiculo = {
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
      const novoVeiculo = {
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
      const novoVeiculo = {
        usuario_id: idUsuarioComum,
        cidade_id: idCidade,
        placa: placaTeste,
        tipo: 'camionete',  // Deveria ser 'utilitário'
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
    it('grava veiculo', function(done) {
      const novoVeiculo = {
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
