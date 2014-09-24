var Bookshelf = require('bookshelf').conexaoMain;
var validator = require('validator');

var validation = require('./validation');



var PessoaJuridica = Bookshelf.Model.extend({
    tableName: 'pessoa_juridica',
    idAttribute: 'id_pessoa_juridica'
});


exports.validate = function(pessoaJuridica){

   if (validator.isNull(pessoaJuridica.attributes.cnpj) == true || pessoaJuridica.attributes.cnpj == '') {
        console.log("Cnpj obrigatório!");
        return false;
    }

    if(validation.isCNPJ(pessoaJuridica.attributes.cnpj) != true){
        console.log("Cnpj inválido!");
        return false;
    }

   if (validator.isNull(pessoaJuridica.attributes.razao_social) == true || pessoaJuridica.attributes.razao_social == '') {
        console.log("Cnpj razao social!");
        return false;
    }

   if (validator.isNull(pessoaJuridica.attributes.contato) == true || pessoaJuridica.attributes.contato == '') {
        console.log("Contato obrigatório!");
        return false;
    }
    return true;
}

exports.PessoaJuridica = PessoaJuridica;