var bcrypt = require('bcrypt');
var Areaazul_mailer = require('areaazul-mailer');
var moment = require('moment');
var winston = require('winston');

exports.enviarEmailConfirmacao = function(entidade, login, senha){
    var message = {
        from: 'Stiket <cadastro@areaazul.org>',
        to:  entidade.email,
        cc: 'cadastro@areaazul.org',
        subject: 'AreaAzul confirmação de cadastro',
        html: '<p><b></b>  Por favor   '+ entidade.nome + ' clique no link abaixo para confirmação do cadastro. </br> http://demo.areaazul.org/login </br> Usuario:  '+ login +' </br>  Senha é:  '+ senha + '.',
    }
    Areaazul_mailer.enviar.emailer(message);
}

exports.generate = function(){
        this.pass = "";
        var chars = 4;

        for (var i= 0; i<chars; i++) {
            this.pass += getRandomChar();
        }
        return this.pass;
}

function getRandomChar() {
        var ascii = [[48, 57],[64,90],[97,122]];
        var i = Math.floor(Math.random()*ascii.length);
        return String.fromCharCode(Math.floor(Math.random()*(ascii[i][1]-ascii[i][0]))+ascii[i][0]);
}

{
    var salt = '$2a$10$VfS9mOR1XGDT3TDUw8Uxge';
    exports.criptografa = function(password){
        //var salt = bcrypt.genSaltSync(10);
        return bcrypt.hashSync(password, salt);
    }
}

exports.converteData = function(data){
    return moment(Date.parse(data)).format("YYYY-MM-DD");
}

exports.log = function(log, type) {
    var logger = new(winston.Logger)({
        transports: [
            new(winston.transports.Console)(),
            new(winston.transports.File)({
                filename: 'logging.log'
            })
        ]
    });
    logger.info(log);
}

exports.geradorUUID = function(){
    function _p8(s){
        var p =(Math.random().toString(16)+"000000000").substr(2,8);
        return s ? "-" + p.substr(0,4) + "-" + p.substr(4,4) : p ;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}