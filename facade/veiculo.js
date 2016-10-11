const log = require('../logging');
const Bookshelf = require('../database');

const Ativacoes = Bookshelf.collection('Ativacoes');
const Veiculo = Bookshelf.model('Veiculo');

module.export.listar = function() {
  var veiculos = {};
  return Ativacoes
    ._listarAtivacoes()
    .then(function(ativacoes) {
      veiculos.ativos = ativacoes;
    })
    .then(function() {
      return Ativacoes
        ._listarAtivacoesExpirando();
    })
    .then(function(ativacoesExpirando) {
      veiculos.expirando = ativacoesExpirando;
    })
    .then(function() {
      return Ativacoes
        ._listarAtivacoesExpiraram();
    })
    .then(function(ativacoesExpiradas) {
      veiculos.expirados = ativacoesExpiradas;
    })
    .then(() => {
      return veiculos;
    });
};

module.export.cadastrar = function(camposVeiculo) {
  log.info('Veiculo.cadastrar()', { campos: camposVeiculo });

  return Bookshelf.transaction(function(t) {

    return Veiculo._cadastrar(camposVeiculo, { transacting: t });

  });
};

module.export.procurarVeiculo = function(placa) {
  return Bookshelf.transaction(t => {
    return Veiculo._procurarVeiculo(placa, { transacting: t });
  });
};

module.export.buscarPorId = function(id) {
  return new Veiculo({ id: id })
    .fetch({
      withRelated: [ 'cidade', 'cidade.estado' ],
      require: true
    });
};

