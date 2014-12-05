var bcrypt = require('bcrypt'),
    LocalStrategy = require('passport-local').Strategy,
    AreaAzul = require('areaazul'),
    Usuario = AreaAzul.models.usuario;

module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        console.log(user)
        done(null, user.id_usuario);
    });

    passport.deserializeUser(function(user_id, done) {
        var user = Usuario.getById(user_id);
        return done(null, user);
    }, function(error) {
        return done(error);
    });

    passport.use(new LocalStrategy({
            usernameField: 'login',
            passwordField: 'senha'
        }, function(username, password, done) {
            var user = Usuario.search(new Usuario.Usuario({
                'login': username,
            }), function(retorno) {



                if (retorno != null) {
                    var pwd = retorno['senha'];
                    var acesso = retorno['primeiro_acesso'];
                    var hash = bcrypt.compareSync(password, pwd);

                    if (pwd != null && hash != false) {
                        console.log("Passei aq");
                        if(acesso == true){
                            console.log('Primeiro acesso.');
                            return done(null, retorno);
                        }
                        return done(null, retorno);
                    }
     
                }else{
                    return done(null, false, {
                    'message': 'Senha invalida!'
                    });
                }


            })
        },
        function(error) {
            return done(null, false, {
                'message': 'Usuario desconhecido!'
            });
        }));
}