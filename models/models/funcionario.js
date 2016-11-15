const Bookshelf = require('../../database');

const Funcionario = Bookshelf.Model.extend(
  {
    tableName: 'funcionario'
  });
Bookshelf.model('Funcionario', Funcionario);
