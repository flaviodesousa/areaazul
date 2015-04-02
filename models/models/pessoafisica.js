var Bookshelf = require('bookshelf').conexaoMain;
var validator = require("validator");
var validation = require("./validation");
var util = require('./util');

var PessoaFisica = Bookshelf.Model.extend({
    tableName: 'pessoa_fisica',
    idAttribute: 'id_pessoa_fisica'
});

exports.PessoaFisica = PessoaFisica;

exports.validate = function(pessoaFisica) {

    if (validator.isNull(pessoaFisica.attributes.cpf) == true || pessoaFisica.attributes.cpf == '') {
        util.log("Cpf obrigatório");
        return false;
    }

    if (validation.isCPF(pessoaFisica.attributes.cpf) == false) {
        util.log("Cpf Inválido");
        return false;
    }

    if (pessoaFisica.attributes.data_nascimento == '') {
        util.log("Data Nascimento obrigatório");
        return false;
    }
  /*  if (validation.validarData(individuals.attributes.data_nascimento) == false) {
        util.log("Data Nascimento não pode ser maior ou igual do que a data atual");
        return false;
    }*/
    return true;
}


exports.CPFnovo = function(person, then, fail){

    PessoaFisica.forge().query(function(qb){
        qb.where('pessoa_fisica.cpf', person.cpf);
        qb.select('pessoa_fisica.*');
    }).fetch().then(function(model) {
        if(model != null){
            throw new Error("Cpf já existe!!!");
        }
        then(model);
    }).catch(function(err){
        fail(err);
    });
}