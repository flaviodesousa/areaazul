var bcrypt = require('bcrypt'),
    LocalStrategy = require('passport-local').Strategy,
    AreaAzul = require('areaazul'),
    Usuario = AreaAzul.models.usuario;


module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
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
            })).then(function(retorno) {
                console.log('cheguei aqui 2');
                console.log(username);
                console.log(retorno);
                var pwd = retorno.get('senha');
                var teste = false;
                var teste = bcrypt.compareSync(password, pwd);

                if (pwd != null && teste != false) {
                    return done(null, retorno);
                }
                return done(null, false, {
                    'message': 'Senha invalida!'
                });
            })
        },
        function(error) {
            return done(null, false, {
                'message': 'Usuario desconhecido!'
            });
        }));
}