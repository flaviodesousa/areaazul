const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;

var Funcionario = Bookshelf.Model.extend({
    tableName: 'funcionario'
});
Bookshelf.model('Funcionario', Funcionario);
