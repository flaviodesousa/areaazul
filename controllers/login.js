var bcrypt = require('bcrypt');
var passport = require('passport');
var areaazul = require('areaazul');


module.exports = function(app) {
    var loginController = {
        index: function(req, res) {
            res.render('login/index');
        },

        autenticar: function(req, res, next) {
            passport.authenticate('local', function(err, user, info) {
                if (err || !user) {
                    return res.render('login/index', {
                        error: 'true'
                    });
                }
                req.logIn(user, function(err) {
                    if (err) {
                        console.log(err);
                        return res.render('login/index', {
                            error: 'true'
                        });
                    }
                    if(user.primeiro_acesso == true){
                        return res.render('/usuario/home', {value:user.id_usuario});
                      /* console.log(user.id_usuario);
                        return res.render('usuario/home', function(user){
                            vvalor = 
                        });*/
                }
                    
                    return res.redirect('/revendedor/pj ');
                });
            })(req, res, next);


        }
    }
    return loginController;
}