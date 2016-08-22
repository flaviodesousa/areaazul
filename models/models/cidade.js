'use strict';

const AreaAzul = require('../../areaazul');
const Bookshelf = AreaAzul.db;

var Cidade = Bookshelf.Model.extend({
    tableName: 'cidade',
    estado: function() {
        return this.belongsTo('Estado', 'estado_id');
    },
}, {
    cadastrar: function(city) {
        return Cidade
            .forge({
                nome: city.nome,
                estado_id: city.estado_id,
            })
            .save()
            .then(function(cidade) {
                return cidade;
            });

    },
});
Bookshelf.model('Cidade', Cidade);

module.exports = Cidade;
