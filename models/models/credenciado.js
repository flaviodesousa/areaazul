var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa');
var PessoaFisica = require('./pessoafisica');
var Usuario = require('./usuario');
var UsuarioCollection = require('../collections/usuario');
var PessoaJuridica = require('./pessoajuridica');
var PessoaJuridicaCollection = require('../collections/pessoajuridica');
var PessoaCollection = require('../collections/pessoa');
var PessoaFisicaCollection = require('../collections/pessoafisica');
var Areaazul_mailer = require('areaazul-mailer');
var validation = require('./validation');
var util = require('./util');
var validator = require("validator");

var Credenciado = Bookshelf.Model.extend({
    tableName: 'credenciado',
    idAttribute: 'id_credenciado'
});

exports.Credenciado = Credenciado;


exports.cadastrar = function(dealer, then, fail) {
    var senhaGerada = util.generate();
    var senha = util.criptografa(senhaGerada);

    var login;
     if(dealer.cpf != null){
        login = dealer.cpf;
    }else{
        login = dealer.cnpj;
    }

   var usuario = new Usuario.Usuario({
            'login': login,
            'autorizacao': '1',
            'primeiro_acesso': 'true',
            'senha': senha,
            'ativo': 'true'
    });

    var credenciado = new this.Credenciado({
            'ativo': 'true'
    });

    var pessoa = new Pessoa.Pessoa({
        'nome': dealer.nome,
        'email': dealer.email,
        'telefone': dealer.telefone,
        'ativo': 'true'
    });

    var pessoaJuridica = new PessoaJuridica. PessoaJuridica({
           'cnpj': dealer.cnpj,
           'nome_fantasia': dealer.nome,
           'razao_social': dealer.razao_social,
           'contato': dealer.contato,
           'ativo': 'true'
    });

    var pessoaFisica = new PessoaFisica.PessoaFisica({
        'cpf': dealer.cpf,
        'ativo': 'true'
    });


    if(validator.isNull(pessoaFisica.attributes.cpf) == false){

            if((PessoaFisica.validate(pessoaFisica) == true) &&(Pessoa.validate(pessoa) == true) ){
                console.log("Pessoa Fisica");
             new PessoaFisica.PessoaFisica({
                'cpf': dealer.cpf,
            }).fetch().then(function(model) { 
              if(model == null){
                Pessoa.transaction(pessoa, credenciado, usuario, pessoaFisica, 
                    function(result, err){
                        if(result == true){
                            util.enviarEmail(dealer, login, senhaGerada);
                            then(result);
                        }else{
                            fail(result);
                        }
                        if(err){
                            fail(err);  
                        }
                    }
                )
                } else {
                    console.log("CPF já existe!");
                    fail(false);
                }
            });
        }else{
            console.log("Campos obrigatórios!");
            fail(false);
        }
    } else {

    if((Pessoa.validate(pessoa) == true) && (PessoaJuridica.validate(pessoaJuridica) == true)){
        new PessoaJuridica.PessoaJuridica({
            'cnpj': dealer.cnpj,
        }).fetch().then(function(model) { 
        if(model == null){
                Pessoa.transaction(pessoa, credenciado, usuario, pessoaJuridica, 
                    function(result, err){
                        if(result == true){
                            util.enviarEmail(dealer, login, senhaGerada);
                            then(result);
                        }else{
                            fail(result);
                        }
                        if(err){
                            fail(err);  
                        }
                    }
                )
            } else {
                console.log("CNPJ já existe!");
                fail(false);
            }
            });
            }else{
                console.log("Campos obrigatórios!");
                fail(false);
            }
    }
}

