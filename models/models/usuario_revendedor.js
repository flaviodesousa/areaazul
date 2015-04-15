var Bookshelf = require('bookshelf').conexaoMain;

var Usuario_Revendedor = Bookshelf.Model.extend({
    tableName: 'usuario_revendedor',
    idAttribute: 'id_usuario_revendedor',
});

exports.search = function(entidade, func) {
    entidade.fetch().then(function(model, err) {
        if (model != null)
            var retorno = model.attributes;
        if (err) {
            return func(null);
        }
        func(retorno);
    });
}


exports.alterarSenha = function(user, then, fail){  
        new this.Usuario_Revendedor({
            id_usuario_revendedor: user.id_usuario_revendedor
        }).fetch().then(function(model) { 
            if (model != null) {                                                                                                                                                             
                var pwd = model.attributes.senha;
            }
            var hash = bcrypt.compareSync(user.senha, pwd);
            console.log("hash"+hash);
            if(hash != false){
                var new_senha = util.criptografa(user.nova_senha);
            
                model.save({
                    primeiro_acesso: 'false',
                    senha : new_senha,
                    ativo : 'true'
                }).then(function(model){
                    util.log("Alterado com sucesso!");
                    then(model);
                }).catch(function(err){
                    util.log("Houve erro ao alterar");
                    util.log("Model: "+model.attributes);
                    fail(model.attributes);
                    fail(err);
                });
             } else {
                fail();
             }
     }).catch(function(err){
        fail(err);
     });
}

exports.validarSenha = function(user){
    var message = [];
    if(user.nova_senha == null || user.nova_senha == ''){
        message.push({attribute : 'nova_senha', problem : "Nova senha é obrigatório!"});
    }
    if(user.senha == null || user.senha == ''){
        message.push({attribute : 'senha', problem : "Senha é obrigatório!"});
    }
    if(user.conf_senha == null || user.conf_senha == ''){
        message.push({attribute : 'conf_senha', problem : "Confirmação de senha é obrigatório!"});
    }
    if(user.nova_senha  != user.conf_senha){
        message.push({attribute : 'nova_senha', problem : "As senhas devem ser iguais!"});                                               
    }
    if(user.senha.length < 4 && user.senha.length > 8 ){
        message.push({attribute : 'senha', problem : "A senha deve conter no minimo 4 a 8 caracteres!"});  
    }
    if(user.conf_senha.length < 4 && user.conf_senha.length > 8 ){
        message.push({attribute : 'conf_senha', problem : "A confirmação de senha deve conter no minimo 4 a 8caracteres!"});  
    }
    if(user.nova_senha.length < 4 && user.nova_senha.length  > 8 ){
        message.push({attribute : 'nova_senha', problem : "A nova senha deve conter no minimo 4 a 8 caracteres!"});  
    }

    for(var i = 0; i<message.length;i++){
        console.log("Atributo: "+message[i].attribute+" Problem: "+message[i].problem);
    }

    return message;
}

exports.Usuario_Revendedor = Usuario_Revendedor;