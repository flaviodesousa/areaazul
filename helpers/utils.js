var bcrypt = require('bcrypt');
var Areaazul_mailer = require('areaazul-mailer');
var moment = require('moment');


exports.enviarEmail = function(user, senha){
    console.log(user.email);
    var message = {
        from: 'AreaAzul <jeffersonarar@hotmail.com>', 
        to:  user.email,
        cc: 'jeffersonarar@hotmail.com',
        subject: 'AreaAzul confirmação de cadastro', 
        html: '<p><b></b>  Por favor   '+ user.nome + ' clique no link abaixo para confirmação do cadastro. </br> </br>  Sua senha é '+ '<h4>'+ senha +'</h4>',
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