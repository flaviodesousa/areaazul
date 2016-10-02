const validator = require('validator');
const util = require('areaazul-utils');


exports.isCPF = function(cpf) {
  var i,rev,add;
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf == '') { return false; }
  // Elimina CPFs invalidos conhecidos
  if (cpf.length != 11 ||
    cpf == '00000000000' ||
    cpf == '11111111111' ||
    cpf == '22222222222' ||
    cpf == '33333333333' ||
    cpf == '44444444444' ||
    cpf == '55555555555' ||
    cpf == '66666666666' ||
    cpf == '77777777777' ||
    cpf == '88888888888' ||
    cpf == '99999999999') {
    return false;
  }
  // Valida 1o digito
  add = 0;
  for (i = 0; i < 9; i++) {
    add += parseInt(cpf.charAt(i)) * (10 - i);
  }
  rev = 11 - (add % 11);
  if (rev == 10 || rev == 11) { rev = 0; }
  if (rev != parseInt(cpf.charAt(9))) { return false; }
  // Valida 2o digito
  add = 0;
  for (i = 0; i < 10; i++) {
    add += parseInt(cpf.charAt(i)) * (11 - i);
  }
  rev = 11 - (add % 11);
  if (rev == 10 || rev == 11) {
    rev = 0;
  }
  return rev == parseInt(cpf.charAt(10));
};

exports.isCNPJ = function(str) {
  var cnpj, numeros, digitos, soma, i, resultado, pos, tamanho, digitosIguais;
  str = str.replace('.', '');
  str = str.replace('.', '');
  str = str.replace('.', '');
  str = str.replace('-', '');
  str = str.replace('/', '');
  cnpj = str;
  if (cnpj.length < 14 && cnpj.length < 15) {
    return false;
  }
  digitosIguais = true;
  for (i = 0; i < cnpj.length - 1; i++) {
    if (cnpj.charAt(i) != cnpj.charAt(i + 1)) {
      digitosIguais = false;
      break;
    }
  }
  if (digitosIguais) {
    return false;
  }
  tamanho = cnpj.length - 2;
  numeros = cnpj.substring(0, tamanho);
  digitos = cnpj.substring(tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado != digitos.charAt(0)) {
    return false;
  }
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;
  for (i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) {
      pos = 9;
    }
  }
  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  return resultado == digitos.charAt(1);
};
