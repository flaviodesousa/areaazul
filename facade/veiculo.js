const log = require('../logging');
const Bookshelf = require('../database');
const AreaAzul = require('../areaazul');

const Ativacoes = Bookshelf.collection('Ativacoes');
const Veiculo = Bookshelf.model('Veiculo');

module.exports.listar = function() {
  let veiculos = {};
  return Ativacoes
    ._listarAtivacoes()
    .then(function(ativacoes) {
      veiculos.ativos = ativacoes.toJSON();
    })
    .then(function() {
      return Ativacoes
        ._listarAtivacoesExpirando();
    })
    .then(function(ativacoesExpirando) {
      veiculos.expirando = ativacoesExpirando.toJSON();
    })
    .then(function() {
      return Ativacoes
        ._listarAtivacoesExpiraram();
    })
    .then(function(ativacoesExpiradas) {
      veiculos.expirados = ativacoesExpiradas.toJSON();
    })
    .then(() => {
      return veiculos;
    })
    .catch((e) => {
      throw new AreaAzul.BusinessException('Falha obtendo relatórios de veículos', { exception: e });
    });
};

module.exports.cadastrar = function(camposVeiculo) {
  log.info('Veiculo.cadastrar()', { campos: camposVeiculo });
  return Bookshelf.transaction(t =>
    Veiculo
      ._cadastrar(camposVeiculo, { transacting: t }))
    .then(veiculo => veiculo.toJSON());
};

module.exports.buscarPorPlaca = placa =>
  Bookshelf.transaction(t =>
    Veiculo
      ._buscarPorPlaca(placa, { transacting: t }))
    .then(veiculo => veiculo ? veiculo.toJSON() : null);

module.exports.buscarPorId = id => Veiculo._buscarPorId(id, null);


