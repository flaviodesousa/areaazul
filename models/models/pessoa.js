var Bookshelf = require('bookshelf').conexaoMain;
var PesquisaPessoa = require("./pessoa");
var validator = require("validator");
var async = require("async");


var Pessoa = Bookshelf.Model.extend({
    tableName: 'pessoa',
    idAttribute: 'id_pessoa'
});


exports.Pessoa = Pessoa;

exports.validate = function(person) {

    if (validator.isNull(person.attributes.nome) == true || person.attributes.nome == '') {
        console.log("Nome obrigatório");
        return false;
    } else if (validator.isNull(person.attributes.telefone) == true || person.attributes.telefone == '') {
        console.log("Telefone obrigatório");
        return false;
    } else if (validator.isNull(person.attributes.email) == true || person.attributes.email == '') {
        console.log("Email obrigatório: " + person.attributes.email);
        return false;
    } else if (validator.isEmail(person.attributes.email) == false) {
        console.log("Email inválido");
        return false;
    }
    return true;
}

/*
exports.valida = function(param, func){
    if(this.validate(param.person) == true)
     {
        new PesquisaPessoa.Pessoa({
            nome: param.person.attributes.nome
        }).fetch().then(function(model, err) {
         if (model == null) {
                new PesquisaPessoa.Pessoa({
                    telefone: param.person.attributes.telefone
                }).fetch().then(function(model, err) {
                    if (model == null) {
                        console.log("Telefone não existe");
                        func(true);
                    }else{
                        console.log("Telefone existe");
                        func(false);
                    }
                    if (err) {
                        console.log('Erro');
                        func(false);
                    }
                })
                if (err) {
                    console.log('Erro');
                    func(false);
                }
        } else {
            console.log('Nome já cadastrado!');
            func(false);
        }
        if (err) {
            console.log('Erro');
            func(false);
        }
        })
    }else{
        console.log("Campos obrigatorios não preenchidos");
        func(false);
    }
}



exports.search = function(entidade, func) {
    entidade.fetch().then(function(model, err) {
        var retorno = model.attributes;
        if (err) {
            func(err);
        }else{
            func(null, retorno);
        }
    });
}

function existsPhone(telefonePessoa) {
    new PesquisaPessoa.Pessoa({
        telefone: telefonePessoa
    }).fetch().then(function(model, err) {
        if (err) {
            console.log(err);
            return false;
        }
        if (model != null) {
            console.log('Telefone já foi cadastrado');
            return true;
        }
        return false;

    })
}

function existsName(nomePessoa, func) {
 new PesquisaPessoa.Pessoa({
        nome: nomePessoa
    }).fetch().then(function(model, err) {
        if (err) {
            func(err);
        }
        if (model != null) {
           func(model);
        }
       
    });
   
}
/*
function checkEmail(emailAddress) {
    var sQtext = '[^\\x0d\\x22\\x5c\\x80-\\xff]';
    var sDtext = '[^\\x0d\\x5b-\\x5d\\x80-\\xff]';
    var sAtom = '[^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+';
    var sQuotedPair = '\\x5c[\\x00-\\x7f]';
    var sDomainLiteral = '\\x5b(' + sDtext + '|' + sQuotedPair + ')*\\x5d';
    var sQuotedString = '\\x22(' + sQtext + '|' + sQuotedPair + ')*\\x22';
    var sDomain_ref = sAtom;
    var sSubDomain = '(' + sDomain_ref + '|' + sDomainLiteral + ')';
    var sWord = '(' + sAtom + '|' + sQuotedString + ')';
    var sDomain = sSubDomain + '(\\x2e' + sSubDomain + ')*';
    var sLocalPart = sWord + '(\\x2e' + sWord + ')*';
    var sAddrSpec = sLocalPart + '\\x40' + sDomain; // complete RFC822 email address spec
    var sValidEmail = '^' + sAddrSpec + '$'; // as whole string
    var reValidEmail = new RegExp(sValidEmail);

    if (reValidEmail.test(emailAddress)) {
        return true;
    }
    return false;
}
*/