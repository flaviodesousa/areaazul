const Bookshelf = require('../../database');
const Funcionario = Bookshelf.model('Funcionario');

const Funcionarios = Bookshelf.Collection.extend({
  model: Funcionario.Funcionario
});
Bookshelf.collection('Funcionarios', Funcionarios);

module.exports = Funcionarios;
