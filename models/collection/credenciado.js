var Bookshelf = require('bookshelf').conexaoMain;
var Credenciado = require("../models/models/credenciado");

module.export = Bookshelf.Collection.extend({
    model: Credenciado.Credenciado
});

exports.validate = function(person) {
    if (person.attributes.nome == null || person.attributes.nome == '') {
        console.log("Nome obrigatório");
        return false;
    } else if (existsName(person.attributes.nome) == true) {
        console.log("Nome já cadastrado");
        return false;
    } else if (person.attributes.telefone == null || person.attributes.telefone == '') {
        console.log("Telefone obrigatório");
        return false;
    } else if (person.attributes.email == null || person.attributes.email == '') {
        console.log("Email obrigatório: " + person.attributes.email);
        return false;
    } else if (checkEmail(person.attributes.email) == false) {
        console.log("Email inválido");
        return false;
    }
    return true;
}