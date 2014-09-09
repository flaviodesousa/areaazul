var bcrypt = require('bcrypt');
var passport = require('passport');
var areaazul = require('areaazul');


module.exports = function(app) {
    var loginController = {
        index: function(req, res) {
            res.render('login/index');
        },

        home: function(req, res){
            res.render('login/home', {value:user.attributes});
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

                        console.log(user.id_usuario);
                       return res.render('usuario/home', {value:user});
                      }
                    
                    return res.redirect('/revendedor/pj');
                });
            })(req, res, next);


        }
}
    
    return loginController;
}