var validator = require("validator");
var util = require('./util');


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

    util.log("1: " + cpf);
    for (var i = 0; i <= cpf.length; i++) {
        cpf = cpf.replace('.', ''); //onde há ponto coloca espaço
        cpf = cpf.replace('/', ''); //onde há barra coloca espaço
        cpf = cpf.replace('-', ''); //onde há traço coloca espaço
        cpf = cpf.replace(' ', ''); //onde há ponto coloca espaço
    }
    util.log("2: " + cpf);

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


exports.isCNPJ = function(CNPJ){

   var cnpj = CNPJ;
   util.log(cnpj);
   util.log(cnpj.length);

   if (cnpj != '') {
        cnpj = cnpj.replace(/[.\-\/]/g, "");
    if (cnpj.length != 14)
        return false;
    var dv = cnpj.substr(cnpj.length - 2, cnpj.length);
    cnpj = cnpj.substr(0, 12);
    /* calcular 1º dígito verificador */
    var soma;
    soma = cnpj[0] * 6;
    soma += cnpj[1] * 7;
    soma += cnpj[2] * 8;
    soma += cnpj[3] * 9;
    soma += cnpj[4] * 2;
    soma += cnpj[5] * 3;
    soma += cnpj[6] * 4;
    soma += cnpj[7] * 5;
    soma += cnpj[8] * 6;
    soma += cnpj[9] * 7;
    soma += cnpj[10] * 8;
    soma += cnpj[11] * 9;
    var dv1 = soma % 11;
    if (dv1 == 10) {
        dv1 = 0;
    }
    /* calcular 2º dígito verificador */
    soma = cnpj[0] * 5;
    soma += cnpj[1] * 6;
    soma += cnpj[2] * 7;
    soma += cnpj[3] * 8;
    soma += cnpj[4] * 9;
    soma += cnpj[5] * 2;
    soma += cnpj[6] * 3;
    soma += cnpj[7] * 4;
    soma += cnpj[8] * 5;
    soma += cnpj[9] * 6;
    soma += cnpj[10] * 7;
    soma += cnpj[11] * 8;
    soma += dv1 * 9;
    var dv2 = soma % 11;
    if (dv2 == 10) {
        dv2 = 0;
    }
    var digito = dv1 + "" + dv2;
    if (dv == digito) { /* compara o dv digitado ao dv calculado */
        return true;
    } else {
        return false;
    }
}
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


exports.validaPlaca = function(vehicle)
{
  var er = /[a-z]{3}-?\d{4}/gim;
  er.lastIndex = 0;
  return er.test(vehicle.placa);
}
