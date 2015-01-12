var Bookshelf = require('bookshelf').conexaoMain;
var PesquisaPessoa = require("./pessoa");
var validator = require("validator");
var util = require('./util');

var Pessoa = Bookshelf.Model.extend({
    tableName: 'pessoa',
    idAttribute: 'id_pessoa'
});

exports.Pessoa = Pessoa;

exports.validate = function(pessoa) {
    if (validator.isNull(pessoa.attributes.nome) == true || pessoa.attributes.nome == '') {
        util.log("Nome obrigatório");
        return false;
    } else if (validator.isNull(pessoa.attributes.telefone) == true || pessoa.attributes.telefone == '') {
        util.log("Telefone obrigatório");
        return false;
    } else if (validator.isNull(pessoa.attributes.email) == true || pessoa.attributes.email == '') {
        util.log("Email obrigatório: " + pessoa.attributes.email);
        return false;
    } else if (validator.isEmail(pessoa.attributes.email) == false) {
        util.log("Email inválido");
        return false;
    }
    return true;
}

exports.saveTransaction = function(entidade1, entidade2, entidade3, func){
        Bookshelf.transaction(function(t) {
            entidade1.save(null, {
                transacting: t
            }).
            then(function(entidade1) {
                util.log(entidade1);
                entidade2.save({
                    pessoa_id: entidade1.id,
                }, {
                    transacting: t
                }).then(function(model, err) {

                    util.log("Model"+model);
                    entidade3.save({
                        pessoa_id: entidade1.id,
                    }, {
                        transacting: t
                    }).then(function(model, err) {
                          util.log("Commit");
                        t.commit();
                    }),
                    function() {
                        t.rollback();
                           util.log("rollback");
                        func(false);
                    }
                });
            });
        }).then(function(model) {
             util.log("Passei aq");
             func(true);
        }, function() {
            util.log("Ocorreu erro");
            func(false);
        });
}

exports.updateTransaction = function(entidade1, entidade2, entidade3, func){
  Bookshelf.transaction(function(t) {
            entidade1.save(null, {
                transacting: t
            }).
            then(function(entidade1) {
                util.log(entidade1);
                entidade2.save({
                    pessoa_id: entidade1.id,
                }, {
                    transacting: t
                },{patch: true}
                ).then(function(model, err) {
                    util.log("Model"+model);
                    entidade3.save({
                        pessoa_id: entidade1.id,
                    }, {
                        transacting: t
                    }, {patch: true}
                    ).then(function(model, err) {
                          util.log("Commit");
                        t.commit();
                    }),
                    function() {
                        t.rollback();
                           util.log("rollback");
                        func(false);
                    }
                });
            });
        }).then(function(model) {
             util.log("Passei aq");
             func(true);
        }, function() {
            util.log("Ocorreu erro");
            func(false);
        });
}

exports.transaction = function(entidade1, entidade2, entidade3, entidade4, func){
        Bookshelf.transaction(function(t) {
            entidade1.save(null, {
                transacting: t
            }).
            then(function(entidade1) 
            {
                util.log(entidade1);
                entidade2.save({
                    pessoa_id: entidade1.id,
                }, {
                    transacting: t
                }).then(function(model, err) {

                    util.log("Model"+model);
                    entidade3.save({
                        pessoa_id: entidade1.id,
                    }, {
                        transacting: t
                    }).then(function(model, err) {


                        entidade4.save({
                            pessoa_id: entidade1.id,
                        }, {
                            transacting: t
                        }).then(function(model, err) {
                              util.log("Commit");
                              t.commit();
                        }),
                        function() {
                            t.rollback();
                               util.log("rollback");
                            func(false);
                        }
                    });
                });
            });

        }).then(function(model) {
             util.log("Passei aq");
             func(true);
        }, function() {
            util.log("Ocorreu erro");
            func(false);
        });
}

exports.transactionUpdate = function(entidade1, entidade2, entidade3, entidade4, func){
 
        Bookshelf.transaction(function(t) {
            entidade1.save(null, {
                transacting: t
            }).
            then(function(entidade1) 
            {
                util.log(entidade1);
                entidade2.save({
                    pessoa_id: entidade1.id,
                }, {
                    transacting: t
                }, {patch: true}).then(function(model, err) {

                    util.log("Model"+model);
                    entidade3.save({
                        pessoa_id: entidade1.id,
                    }, {
                        transacting: t
                    }, {patch: true}).then(function(model, err) {


                        entidade4.save({
                            pessoa_id: entidade1.id,
                        }, {
                            transacting: t
                        }, {patch: true}).then(function(model, err) {
                              util.log("Commit");
                              t.commit();
                        }),
                        function() {
                            t.rollback();
                               util.log("rollback");
                            func(false);
                        }
                    });
                });
            });

        }).then(function(model) {
             util.log("Passei aq");
             func(true);
        }, function() {
            util.log("Ocorreu erro");
            func(false);
        });
}



exports.fiveSaveTransaction= function(entidade1, entidade2, entidade3, entidade4, entidade5, func){
        Bookshelf.transaction(function(t) {
            entidade1.save(null, {
                transacting: t
            }).
            then(function(entidade1) 
            {
                util.log(entidade1);
                entidade2.save({
                    pessoa_id: entidade1.id,
                }, {
                    transacting: t
                }).then(function(model, err) {

                    util.log("Model"+model);
                    entidade3.save({
                        pessoa_id: entidade1.id,
                    }, {
                        transacting: t
                    }).then(function(model, err) {
                        entidade4.save({
                            pessoa_id: entidade1.id,
                        }, {
                            transacting: t
                        }).then(function(model, err) {
                            entidade5.save({
                                pessoa_id: entidade1.id,
                            }, {
                                transacting: t
                            }).then(function(model, err) {
                                  util.log("Commit");
                                  t.commit();
                             }),
                      
                        function() {
                            t.rollback();
                               util.log("rollback");
                            func(false);
                        }
                        });
                    });
                });
            });

        }).then(function(model) {
             util.log("Passei aq");
             func(true);
        }, function() {
            util.log("Ocorreu erro");
            func(false);
        });
}

exports.fiveUpdateTransaction= function(entidade1, entidade2, entidade3, entidade4, entidade5, func){
        Bookshelf.transaction(function(t) {
            entidade1.save(null, {
                transacting: t
            },{patch: true}).
            then(function(entidade1) 
            {
                util.log(entidade1);
                entidade2.save({
                    pessoa_id: entidade1.id,
                }, {
                    transacting: t
                },{patch: true}).then(function(model, err) {

                    util.log("Model"+model);
                    entidade3.save({
                        pessoa_id: entidade1.id,
                    }, {
                        transacting: t
                    },{patch: true}).then(function(model, err) {
                        entidade4.save({
                            pessoa_id: entidade1.id,
                        }, {
                            transacting: t
                        },{patch: true}).then(function(model, err) {
                            entidade5.save({
                                pessoa_id: entidade1.id,
                            }, {
                                transacting: t
                            },{patch: true}).then(function(model, err) {
                                  util.log("Commit");
                                  t.commit();
                             }),
                      
                        function() {
                            t.rollback();
                               util.log("rollback");
                            func(false);
                        }
                        });
                    });
                });
            });

        }).then(function(model) {
             util.log("Passei aq");
             func(true);
        }, function() {
            util.log("Ocorreu erro");
            func(false);
        });
}

exports.sixSaveTransaction = function(entidade1, entidade2, entidade3, entidade4, entidade5, entidade6, func){
        Bookshelf.transaction(function(t) {
            entidade1.save(null, {
                transacting: t
            }).
            then(function(entidade1) 
            {
                util.log(entidade1);
                entidade2.save({
                    pessoa_id: entidade1.id,
                }, {
                    transacting: t
                }).then(function(model, err) {

                    util.log("Model"+model);
                    entidade3.save({
                        pessoa_id: entidade1.id,
                    }, {
                        transacting: t
                    }).then(function(model, err) {
                        entidade4.save({
                            pessoa_id: entidade1.id,
                        }, {
                            transacting: t
                        }).then(function(model, err) {
                            entidade5.save({
                                pessoa_id: entidade1.id,
                            }, {
                                transacting: t
                            }).then(function(model, err) {
                                  entidade6.save({
                                    pessoa_id: entidade1.id,
                                  }, {
                                    transacting: t
                                  }).then(function(model, err) {
                                    util.log("Commit");
                                    t.commit();
                                  }),
                                function() {
                                    t.rollback();
                                    util.log("rollback");
                                    func(false);
                                }
                             });
                        });
                    });
                });
            });

        }).then(function(model) {
             util.log("Passei aq");
             func(true);
        }, function() {
            util.log("Ocorreu erro");
            func(false);
        });
}

exports.sixUpdateTransaction = function(entidade1, entidade2, entidade3, entidade4, entidade5, entidade6, func){
        Bookshelf.transaction(function(t) {
            entidade1.save(null, {
                transacting: t
            },{patch: true}).
            then(function(entidade1) 
            {
                util.log(entidade1);
                entidade2.save({
                    pessoa_id: entidade1.id,
                }, {
                    transacting: t
                },{patch: true}).then(function(model, err) {

                    util.log("Model"+model);
                    entidade3.save({
                        pessoa_id: entidade1.id,
                    }, {
                        transacting: t
                    },{patch: true}).then(function(model, err) {
                        entidade4.save({
                            pessoa_id: entidade1.id,
                        }, {
                            transacting: t
                        },{patch: true}).then(function(model, err) {
                            entidade5.save({
                                pessoa_id: entidade1.id,
                            }, {
                                transacting: t
                            },{patch: true}).then(function(model, err) {
                                  entidade6.save({
                                    pessoa_id: entidade1.id,
                                  }, {
                                    transacting: t
                                  },{patch: true}).then(function(model, err) {
                                    util.log("Commit");
                                    t.commit();
                                  }),
                                function() {
                                    t.rollback();
                                    util.log("rollback");
                                    func(false);
                                }
                             });
                        });
                    });
                });
            });

        }).then(function(model) {
             util.log("Passei aq");
             func(true);
        }, function() {
            util.log("Ocorreu erro");
            func(false);
        });
}