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
                console.log("autenticate method")
                console.log(user);
                if (err || !user) {
                    console.log("erro1");
                    return res.redirect('/revendedor/pf');
                }
                req.logIn(user, function(err) {
                    if (err) {
                        console.log("erro2");
                        return res.redirect('/revendedor/pf');
                    }
                    console.log("erro3");
                    return res.redirect('/revendedor/pj');
                });
            })(req, res, next);


        }
    }
    return loginController;
}