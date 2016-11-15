const Bookshelf = require('../database');

const Funcionario = Bookshelf.Model.extend(
  {
    tableName: 'funcionario'
  });
Bookshelf.model('Funcionario', Funcionario);

const Funcionarios = Bookshelf.Collection.extend({
  model: Funcionario.Funcionario
});
Bookshelf.collection('Funcionarios', Funcionarios);
