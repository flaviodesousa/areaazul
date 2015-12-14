var validator = require("validator");
var util = require('../../helpers/util');


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

exports.isCPF = function(cpf) {  
  
    cpf = cpf.replace(/[^\d]+/g,'');    
    if(cpf == '') return false; 
    // Elimina CPFs invalidos conhecidos    
    if (cpf.length != 11 || 
        cpf == "00000000000" || 
        cpf == "11111111111" || 
        cpf == "22222222222" || 
        cpf == "33333333333" || 
        cpf == "44444444444" || 
        cpf == "55555555555" || 
        cpf == "66666666666" || 
        cpf == "77777777777" || 
        cpf == "88888888888" || 
        cpf == "99999999999")
            return false;       
    // Valida 1o digito 
    add = 0;    
    for (i=0; i < 9; i ++)       
        add += parseInt(cpf.charAt(i)) * (10 - i);  
        rev = 11 - (add % 11);  
        if (rev == 10 || rev == 11)     
            rev = 0;    
        if (rev != parseInt(cpf.charAt(9)))     
            return false;       
    // Valida 2o digito 
    add = 0;    
    for (i = 0; i < 10; i ++)        
        add += parseInt(cpf.charAt(i)) * (11 - i);  
    rev = 11 - (add % 11);  
    if (rev == 10 || rev == 11) 
        rev = 0;    
    if (rev != parseInt(cpf.charAt(10)))
        return false;       
    return true;   
}

exports.isCNPJ = function(str){
    str = str.replace('.','');
    str = str.replace('.','');
    str = str.replace('.','');
    str = str.replace('-','');
    str = str.replace('/','');
    cnpj = str;
    var numeros, digitos, soma, i, resultado, pos, tamanho, digitos_iguais;
    digitos_iguais = 1;
    if (cnpj.length < 14 && cnpj.length < 15)
        return false;
    for (i = 0; i < cnpj.length - 1; i++)
        if (cnpj.charAt(i) != cnpj.charAt(i + 1))
    {
        digitos_iguais = 0;
        break;
    }
    if (!digitos_iguais)
    {
        tamanho = cnpj.length - 2
        numeros = cnpj.substring(0,tamanho);
        digitos = cnpj.substring(tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (i = tamanho; i >= 1; i--)
        {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0))
            return false;
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0,tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (i = tamanho; i >= 1; i--)
        {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1))
            return false;
        return true;
    }
    else
        return false;
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
