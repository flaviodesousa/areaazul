var validator = require("validator");
var validation = require('areaazul/helpers/validation');


exports.validarData = function(dataNascimento) {
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

exports.isCPF = function(CPF) {
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

exports.validarData = function(dataNascimento) {
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

function validateSenha(user){
    if(user.nova_senha == null || user.nova_senha == ''){
        console.log("Campo obrigatório");
        return false;
    }
    if(user.senha == null || user.senha == ''){
        console.log("Campo obrigatório");
        return false;
    }
    if(user.conf_senha == null || user.conf_senha == ''){
        console.log("Campo obrigatório");
        return false;
    }
    if(user.nova_senha  != user.conf_senha){
        console.log("Senhas diferentes"); 
        return false;                                                 
    }
    return true;
}


function verificaTamanhoDasSenhas(user){
    if(user.senha.length < 4 && user.senha.length > 8 ){
        console.log("A senha deve conter no minimo 4 a 8 caracteres");
        return false;
    }
    if(user.conf_senha.length < 4 && user.conf_senha.length > 8 ){
        console.log("A senha deve conter no minimo 4 a 8caracteres");
        return false;
    }
    if(user.nova_senha.length < 4 && user.nova_senha.length  > 8 ){
        console.log("A senha deve conter no minimo 4 a 8 caracteres");
        return false;
    }
    return true;
}

exports.validaPlaca = function(vehicle)
{
  var er = /[a-z]{3}-?\d{4}/gim;
  er.lastIndex = 0;
  return er.test(vehicle.attributes.placa);
}
