const Bookshelf = require('../../database');

var Funcionario = Bookshelf.Model.extend(
  {
    tableName: 'funcionario'
  });
Bookshelf.model('Funcionario', Funcionario);
