var Bookshelf = require('bookshelf').conexaoMain;
var PesquisaPessoa = require("./pessoa");

var Pessoa = Bookshelf.Model.extend({
    tableName: 'pessoa',
    idAttribute: 'id'
});

exports.Pessoa = Pessoa;

exports.validate = function(person) {
    if (person.attributes.nome == null || person.attributes.nome == '') {
        console.log("Nome obrigatório");
        return false;
    } else if (existsName(person.attributes.nome) == true) {
        console.log("Nome já cadastrado");
        return false;
    } else if (person.attributes.telefone == null || person.attributes.telefone == '') {
        console.log("Telefone obrigatório");
        return false;
    } else if (person.attributes.email == null || person.attributes.email == '') {
        console.log("Email obrigatório: " + person.attributes.email);
        return false;
    } else if (checkEmail(person.attributes.email) == false) {
        console.log("Email inválido");
        return false;
    }
    return true;
}

function existsName(nomePessoa) {
    new PesquisaPessoa.Pessoa({
        nome: nomePessoa
    }).fetch().then(function(model, err) {
        if (err) {
            console.log(err);
            return false;
        }
        if (model != null) {
            console.log('Pessoa já Existente');
            return true;
        }
        return false;
    });
}

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