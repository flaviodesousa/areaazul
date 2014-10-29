var Bookshelf = require('bookshelf').conexaoMain;
var validator = require('validator');
var util = require('./util');
var validation = require('./validation');



var PessoaJuridica = Bookshelf.Model.extend({
    tableName: 'pessoa_juridica',
    idAttribute: 'id_pessoa_juridica'
});


exports.validate = function(pessoaJuridica){

   if (validator.isNull(pessoaJuridica.attributes.cnpj) == true || pessoaJuridica.attributes.cnpj == '') {
        util.log("Cnpj obrigatório!");
        return false;
    }

    if(validation.isCNPJ(pessoaJuridica.attributes.cnpj) != true){
        util.log("Cnpj inválido!");
        return false;
    }

   if (validator.isNull(pessoaJuridica.attributes.razao_social) == true || pessoaJuridica.attributes.razao_social == '') {
        util.log("Cnpj razao social!");
        return false;
    }

   if (validator.isNull(pessoaJuridica.attributes.contato) == true || pessoaJuridica.attributes.contato == '') {
        util.log("Contato obrigatório!");
        return false;
    }
    return true;
}

exports.PessoaJuridica = PessoaJuridica;