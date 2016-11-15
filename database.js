const debug = require('debug')('areaazul:configuration:database');

const knexfile = require('./knexfile');

const knex = require('knex')(knexfile[process.env.NODE_ENV || 'development']);
debug('knex loaded');

const Bookshelf = require('bookshelf')(knex);
Bookshelf.plugin('registry');

module.exports = Bookshelf;
debug('Bookshelf loaded', Bookshelf.VERSION);

[
  'estado', 'cidade', 'conta', 'contrato', 'pessoa', 'pessoa_fisica',
  'pessoa_juridica', 'usuario_revendedor', 'revendedor', 'funcionario',
  'veiculo', 'configuracao', 'movimentacao_conta',
  'usuario', 'usuario_administrativo', 'usuario_fiscal',
  'usuario_has_veiculo', 'ativacao', 'fiscalizacao', 'token'
].forEach(model => {
  debug('Registrando modelo ' + model);
  require('./models/models/' + model);
});

debug('Models registrados');

[
  'ativacoes', 'cidades', 'contas', 'contratos', 'estados', 'fiscalizacoes',
  'funcionarios', 'movimentacoes_contas', 'pessoas', 'pessoas_fisicas',
  'pessoas_juridicas', 'revendedores', 'usuarios', 'usuarios_have_veiculos',
  'usuarios_revendedores', 'usuarios_fiscais', 'veiculos'
].forEach(collection => {
  debug('Registrando coleção ' + collection);
  require('./models/collections/' + collection);
});

debug('Collections registradas');
