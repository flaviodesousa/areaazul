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
                        return res.render('login/index', {
                            error: 'true'
                        });
                    }
                    return res.redirect('/revendedor/pj ');
                });
            })(req, res, next);


        }
    }
    return loginController;
}