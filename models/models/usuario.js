'use strict';

var _ = require('lodash');
var Bookshelf = require('bookshelf').conexaoMain;
var Pessoa = require('./pessoa');
var PessoaFisica = require('./pessoafisica').PessoaFisica;
var UsuarioCollection = require('../collections/usuario');
var bcrypt = require('bcrypt');
var validator = require('validator');
var validation = require('./validation');
var util = require('../../helpers/util');
var Conta = require('./conta');
var UsuarioHasVeiculo = require('./usuario_has_veiculo');
var Veiculo = require('./veiculo').Veiculo;
var AreaAzul = require('../../areaazul.js');

var Usuario = Bookshelf.Model.extend({
    tableName: 'usuario',
    idAttribute: 'pessoa_id',
    pessoaFisica: function() {
        return this.hasOne(PessoaFisica, 'pessoa_id');
    },
    veiculos: function() {
        return this.hasMany(Veiculo)
            .through(UsuarioHasVeiculo);
    },



}, {

    buscarPorId: function(id) {
        var Usuario = this;

        return Usuario
            .forge({
                pessoa_id: id
            })
            .fetch()
            .then(function(u) {
                if (u) {
                    return u;
                }
                var err = new AreaAzul.BusinessException(
                    'Usuario: id nao encontrado', {
                        id: id
                    });
                log.warn(err.message, err.details);
                throw err;
            });
    },

    autorizado: function(login, senha) {
        var Usuario = this;
        var err;
        return Usuario
            .forge({
                login: login
            })
            .fetch()
            .then(function(usuario) {
                if (usuario === null) {
                    err = new AreaAzul.BusinessException(
                        'Usuario: login invalido', {
                            login: login
                        });
                    log.warn(err.message, err.details);
                    throw err;
                }
                if (util.senhaValida(senha, usuario.get('senha'))) {
                    return usuario;
                } else {
                    err = new AreaAzul.BusinessException(
                        'Usuario: senha incorreta', {
                            login: login
                        });
                    log.warn(err.message, err.details);
                    throw err;
                }
            });
    },

    inserir: function(entidade) {

        console.log('Consegui chegar!!!!');
        return Bookshelf.transaction(function(t) {
            var trx = {
                transacting: t
            };
            var trxIns = _.merge({}, trx, {
                method: 'insert'
            });
            return Usuario._inserir(entidade, trxIns, trx);
        });
    },

    _salvarUsuario: function(entidade, options, t) {

        var UsuarioAtual = this;
        var usuario = null;
        var Usuario = this;
        var usuario;
        var login;
        var senha;
        var senhaGerada;
    
        if (!entidade.senha) {
            senha = util.criptografa(util.generate());
        } else {
            senha = util.criptografa(entidade.senha);
            entidade.senha = senha;
        }

        if (!entidade.login) {
            login = entidade.cpf;
        } else {
            login = entidade.login;
        }
        return Usuario
            .validate(entidade, options.method)
            .then(function(messages) {
                
                if (messages.length) {
                    throw new AreaAzul
                        .BusinessException(
                            'Nao foi possivel cadastrar novo Usuario. Dados invalidos',
                            messages);
                }
                return messages;
            }).then(function() {
                return PessoaFisica
                    .forge({
                        cpf: entidade.cpf
                    })
                    .fetch()
                    .then(function(pessoaFisica) {
                        if (pessoaFisica !== null) {
                            return PessoaFisica.alterar(entidade, t, pessoaFisica.id);
                        } else {
                            return PessoaFisica
                                ._cadastrar(entidade, t);
                        }
                    })
            }).then(function(pf) {
                var dadosUsuario = {
                    pessoa_id: pf.id,
                    login: login,
                    senha: senha,
                    primeiro_acesso: true,
                    ativo: true,
                }

                if (options.method === 'insert') {
                    return UsuarioAtual
                        .forge(dadosUsuario)
                        .save(null, options);
                } else {
                    return UsuarioAtual
                        .forge()
                        .save(dadosUsuario, options);
                }
            }).then(function(entidade) {
                        return Conta
                            .forge({
                                data_abertura: new Date(),
                                saldo: 0,
                                ativo: true,
                                pessoa_id: entidade.id,
                            })
                            .save(null, options);
                
            }).then(function(u_r) {
                return util.enviarEmailConfirmacao(entidade, login, senhaGerada);
            }).then(function(u_r) {
                usuario = u_r;
                return u_r;
            });

    },

    _inserir: function(entidade, options, t) {
        return Usuario._salvarUsuario(entidade, options, t);
    },



    _alterar: function(entidade, options, t) {
        return Usuario._salvarUsuario(entidade, options, t);
    },

    alterar: function(entidade) {
        return Bookshelf.transaction(function(t) {
            var trx = {
                transacting: t
            };
            var trxUpd = _.merge({}, trx, {
                method: 'update'
            }, {
                patch: true
            });
            return Usuario._alterar(entidade, trxUpd, trx);
        });
    },

    search: function(entidade, func) {
        entidade.fetch().then(function(model, err) {
            var retorno;
            if (model !== null) {
                retorno = model.attributes;
            }
            if (err) {
                return func(null);
            }
            func(retorno);
        });
    },

    alterarSenha: function(user, then, fail) {
        new this({
            id_usuario: user.id_usuario,
        })
            .fetch()
            .then(function(model) {
                var pwd;
                if (model !== null) {
                    pwd = model.attributes.senha;
                }
                var hash = bcrypt.compareSync(user.senha, pwd);
                console.log('hash' + hash);
                if (hash !== false) {
                    var novaSenha = util.criptografa(user.nova_senha);

                    model.save({
                        primeiro_acesso: 'false',
                        senha: novaSenha,
                        ativo: 'true',
                    }).then(function(model) {
                        util.log('Alterado com sucesso!');
                        then(model);
                    }).catch(function(err) {
                        util.log('Houve erro ao alterar');
                        util.log('Model: ' + model.attributes);
                        fail(model.attributes);
                        fail(err);
                    });
                } else {
                    fail();
                }
            })
            .catch(function(err) {
                fail(err);
            });
    },


    procurar: function(user, then, fail) {
        Usuario.forge().query(function(qb) {
            qb.join('pessoa',
                'pessoa.id_pessoa', '=', 'usuario.pessoa_id');
            qb.join('pessoa_fisica',
                'pessoa_fisica.pessoa_id', '=', 'pessoa.id_pessoa');
            qb.join('conta',
                'pessoa.id_pessoa', '=', 'conta.pessoa_id');
            qb.where('usuario.id_usuario', user.id_usuario);
            qb.select('usuario.*', 'pessoa.*', 'pessoa_fisica.*', 'conta.*');
        }).fetch().then(function(model) {
            then(model);
        }).catch(function(err) {
            fail(err);
        });
    },


    validate: function(user, operacao) {
        var message = [];

        if (validator.isNull(user.cpf)) {
            message.push({
                attribute: 'cpf',
                problem: 'CPF é obrigatório',
            });
        }

        if (!validation.isCPF(user.cpf)) {
            message.push({
                attribute: 'cpf',
                problem: 'CPF inválido!',
            });
        }

         if (user.data_nascimento === '') {
            message.push({
                attribute: 'data_nascimento',
                problem: 'Data de nascimento é obrigatório!',
            });
        }

        if (validator.isNull(user.nome)) {
            message.push({
                attribute: 'nome',
                problem: 'Nome obrigatório',
            });
        }

        if (validator.isNull(user.email)) {
            message.push({
                attribute: 'email',
                problem: 'Email obrigatório!',
            });
        }

        if (!validator.isEmail(user.email)) {
            message.push({
                attribute: 'email',
                problem: 'Email inválido!',
            });
        }

        return PessoaFisica
            .procurarCPF(user.cpf)
            .then(function(pessoafisica) {
                if (pessoafisica) {
                    message.push({
                        attribute: 'cpf',
                        problem: 'CPF já cadastrado!',
                    });
                }

                return message;
            });
    },

    validateNomeUsuario: function(user) {
        var message = [];
        if (validator.isNull(user.login) || user.login === '') {
            message.push({
                attribute: 'nova_senha',
                problem: 'Login é obrigatório!',
            });
        }
        if ((user.login.length < 4) || (user.login.length > 32)) {
            message.push({
                attribute: 'login',
                problem: 'O nome de login deve conter de 4 a 32 caracteres',
            });
        }
        return message;
    },


    validarSenha: function(user) {
        var message = [];
        if (validator.isNull(user.nova_senha)) {
            message.push({
                attribute: 'nova_senha',
                problem: 'Nova senha é obrigatória!',
            });
        }
        if (validator.isNull(user.senha)) {
            message.push({
                attribute: 'senha',
                problem: 'Senha é obrigatória!',
            });
        }
        if (validator.isNull(user.conf_senha)) {
            message.push({
                attribute: 'conf_senha',
                problem: 'Confirmação de senha é obrigatória!',
            });
        }
        if (user.nova_senha !== user.conf_senha) {
            message.push({
                attribute: 'conf_senha',
                problem: 'As senhas devem ser iguais!',
            });
        }
        if (user.senha.length < 4) {
            message.push({
                attribute: 'senha',
                problem: 'A senha deve conter no minimo 4 caracteres!',
            });
        }
        if (user.conf_senha.length < 4 && user.conf_senha.length > 8) {
            message.push({
                attribute: 'conf_senha',
                problem: 'A confirmação de senha deve conter no minimo 4 caracteres!',
            });
        }
        if (user.nova_senha.length < 4) {
            message.push({
                attribute: 'nova_senha',
                problem: 'A nova senha deve conter no minimo 4 caracteres!',
            });
        }

        return message;
    },



});

module.exports = Usuario;