var Bookshelf = require('bookshelf').conexaoMain;
var validator = require("validator");
var validation = require("./validation");

var PessoaFisica = Bookshelf.Model.extend({
    tableName: 'pessoa_fisica',
    idAttribute: 'id_pessoa_fisica'
});

exports.PessoaFisica = PessoaFisica;

exports.validate = function(pessoaFisica) {

    if (validator.isNull(pessoaFisica.attributes.cpf) == true || pessoaFisica.attributes.cpf == '') {
        console.log("Cpf obrigatório");
        return false;
    }

    if (validation.isCPF(pessoaFisica.attributes.cpf) == false) {
        console.log("Cpf Inválido");
        return false;
    }

    if (pessoaFisica.attributes.data_nascimento == '') {
        console.log("Data Nascimento obrigatório");
        return false;
    }
  /*  if (validation.validarData(individuals.attributes.data_nascimento) == false) {
        console.log("Data Nascimento não pode ser maior ou igual do que a data atual");
        return false;
    }*/
    return true;
}
