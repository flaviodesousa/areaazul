const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;
const Funcionario = Bookshelf.model('Funcionario');

var Funcionarios = Bookshelf.Collection.extend({
  model: Funcionario.Funcionario
});
Bookshelf.collection('Funcionarios', Funcionarios);

module.exports = Funcionarios;
