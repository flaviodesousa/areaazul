'use strict';

var passport = require('passport');

module.exports = function(app) {
  app.get('/users',
    passport.authenticate('basic-usuario', { session: false }),
    app.controllers.users.login);

  app.post('/users/:id_usuario/equipments',
    passport.authenticate('basic-usuario', { session: false }),
    app.controllers.users.equipment_add);

  app.get('/users/:id_usuario/vehicles',
    passport.authenticate('basic-usuario', { session: false }),
    app.controllers.users.vehicles_list);

  app.post('/users/:id_usuario/activations',
    passport.authenticate('basic-usuario', { session: false }),
    app.controllers.users.activations_add);

  app.get('/user/:id_usuario/activations',
    passport.authenticate('basic-usuario', { session: false }),
    app.controllers.users.activations_list);

  app.post('/users/:id_usuario/deactivations',
    passport.authenticate('basic-usuario', { session: false }),
    app.controllers.users.deactivations_add);
};
