var bcrypt = require('bcrypt');
var Areaazul_mailer = require('areaazul-mailer');
var moment = require('moment');


exports.enviarEmail = function(entidade, login, senha){
    console.log(entidade.email);
    var message = {
        from: 'Stiket <jeffersonarar@hotmail.com>', 
        to:  entidade.email,
        cc: 'jeffersonarar@hotmail.com',
        subject: 'AreaAzul confirmação de cadastro', 
        html: '<p><b></b>  Por favor   '+ entidade.nome + ' clique no link abaixo para confirmação do cadastro. </br> Usuario:  '+ login +' </br>  Senha é:  '+ senha + '.',
    }
    console.log(Areaazul_mailer);
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
    
exports.criptografa = function(password){
    var salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);

}
exports.converteData = function(data){
    console.log(data);
    return moment(Date.parse(data)).format("YYYY-MM-DD");
}