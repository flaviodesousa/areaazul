var Bookshelf = require('bookshelf').conexaoMain;

var PessoaFisica = Bookshelf.Model.extend({
    tableName: 'pessoa_fisica',
    idAttribute: 'id'
});

exports.PessoaFisica = PessoaFisica;

exports.validate = function(individuals) {

    if (individuals.attributes.cpf == null || individuals.attributes.cpf == '') {
        console.log("Cpf obrigatório");
        return false;
    }

    if (isCPF(individuals.attributes.cpf) == false) {
        console.log("Cpf Inválido");
        return false;
    }

    if (individuals.attributes.data_nascimento == '' || individuals.attributes.data_nascimento == '') {
        console.log("Data Nascimento obrigatório");
        return false;
    }
    if (validarData(individuals.attributes.data_nascimento) == false) {
        console.log("Data Nascimento não pode ser maior ou igual do que a data atual");
        return false;
    }
    return true;
}

function validarData(dataNascimento) {
    var data = dataNascimento;

    var objDate = new Date();
    objDate.setYear(data.split("-")[2]);
    objDate.setMonth(data.split("-")[1] - 1); //- 1 pq em js é de 0 a 11 os meses
    objDate.setDate(data.split("-")[0]);

    if (objDate.getTime() > new Date().getTime()) { // Data Maior
        return false;
    }
    if (objDate.getTime() < new Date().getTime()) { // Data Menor
        return true;
    } else {
        return false; // Data igual
    }
}

function isCPF(CPF) {
    var cpf = CPF;

    console.log("1: " + cpf);
    for (var i = 0; i <= cpf.length; i++) {
        cpf = cpf.replace('.', ''); //onde há ponto coloca espaço
        cpf = cpf.replace('/', ''); //onde há barra coloca espaço
        cpf = cpf.replace('-', ''); //onde há traço coloca espaço
        cpf = cpf.replace(' ', ''); //onde há ponto coloca espaço
    }
    console.log("2: " + cpf);

    var digitoDigitado = eval(cpf.charAt(9) + cpf.charAt(10));
    var soma1 = 0,
        soma2 = 0;
    var vlr = 11;

    for (i = 0; i < 9; i++) {
        soma1 += eval(cpf.charAt(i) * (vlr - 1));
        soma2 += eval(cpf.charAt(i) * vlr);
        vlr--;
    }

    soma1 = (((soma1 * 10) % 11) == 10 ? 0 : ((soma1 * 10) % 11));
    soma2 = (((soma2 + (2 * soma1)) * 10) % 11);

    var digitoGerado = (soma1 * 10) + soma2;

    if (digitoGerado != digitoDigitado) {
        return false;
    }
    return true;
}