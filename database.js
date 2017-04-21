const debug = require('debug')('areaazul:configuration:database');

const knex = require('knex')(JSON.parse(process.env.AREAAZUL_DB));
debug('knex loaded');

const Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('registry');

module.exports = Bookshelf;
debug('Bookshelf loaded', Bookshelf.VERSION);

[
  'estado', 'cidade', 'conta',
  'configuracao', 'movimentacao_conta',
  'contrato',
  'pessoa', 'pessoa_fisica', 'pessoa_juridica',
  'funcionario', 'veiculo',
  'usuario', 'usuario_administrativo', 'usuario_fiscal',
  'usuario_revendedor', 'revendedor',
  'usuario_has_veiculo', 'ativacao', 'fiscalizacao', 'token'
].forEach(model => {
  debug('Registrando modelo ' + model);
  require('./models/' + model);
});

debug('Models registrados');
