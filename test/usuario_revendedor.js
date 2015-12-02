'use strict';

var should = require('chai').should();
var TestHelpers = require('../helpers/test');
var AreaAzul = require('../areaazul');
var BusinessException = AreaAzul.BusinessException;
var UsuarioRevendedor = AreaAzul.models.UsuarioRevendedor;
var UsuarioRevendedorCollection = AreaAzul.collections.UsuarioRevendedor;
var PessoaFisica = AreaAzul.models.pessoafisica.PessoaFisica;


describe('models.UsuarioRevendedor', function() {
    var cpfPreExistente = '12341184758';
    var cpfNaoExistente = '58316661667';
    //  var loginRevendaNaoExistente = 'revenda-nao-existente';
    var senhaRevendaExistente = 'senha-adm-pre-existente';
    var loginRevendaExistente = 'revenda-teste';
    var idUsuarioRevendedor = null;
    var loginAutorizado = null;
    var senhaAutorizado = 'senha-teste';
    var revendedor_id = null;
    var termo_servico = true;

    function apagarDadosDeTeste() {
        return TestHelpers.apagarUsuarioRevenda(idUsuarioRevendedor);
    }

    before(function(done) {
          var usuario;
          return TestHelpers.pegarUsuarioRevendedor()
              .then(function(revendedor) {

                  revendedor_id = revendedor.id;
                  loginAutorizado = revendedor.get('login');
                 // senhaAutorizado = revendedor.get('senha');
              })
              .then(function() {
                  done();
              })
              .catch(function(e) {
                  done(e);
              });
      });


    describe('cadastrar()', function() {

        it('cadastra usuario revendedor com cpf novo', function(done) {
            UsuarioRevendedor.inserir({
                login: loginRevendaExistente,
                nome: 'Revenda Teste',
                autorizacao: 'funcionario',
                senha: senhaRevendaExistente,
                email: 'revenda@teste.com',
                cpf: cpfNaoExistente,
                revendedor_id: revendedor_id,
                termo_servico: termo_servico,
            })
            .then(function(pessoa) {

                should.exist(pessoa);
                revendedor_id = pessoa.get('revendedor_id');
                // Salvar id para testes de buscarPorId()
                idUsuarioRevendedor = pessoa.id;
                done();
            })
            .catch(function(e) {
                done(e);
            });
        });
    });

    describe('alterar()', function() {

        it('altera usuario revendedor', function(done) {
            UsuarioRevendedor.alterar({
                login: 'loginRevendaExistente',
                nome: 'Revenda Teste',
                autorizacao: 'funcionario',
                senha: senhaRevendaExistente,
                email: 'revenda@teste.com',
                cpf: cpfNaoExistente,
                revendedor_id: revendedor_id,
                termo_servico: termo_servico,
            })
            .then(function(pessoa) {
                should.exist(pessoa);
                revendedor_id = pessoa.get('revendedor_id');
                // Salvar id para testes de buscarPorId()
                idUsuarioRevendedor = pessoa.id;
                done();
            })
            .catch(function(e) {
                done(e);
            });
        });
    });




    describe('listarUsuarioRevenda()', function() {

        it('lista usuario da revenda mantidos no banco de dados', function(done) {
            UsuarioRevendedorCollection.listarUsuarioRevenda(revendedor_id,
                function() {
                    done();
                },
                function(e) {
                    done();
                });
        });
    });

    describe('autorizado()', function() {

        it('aceita credencial valida', function(done) {
            UsuarioRevendedor.autorizado(
                loginAutorizado,
                senhaAutorizado)
                .then(function(usuarioRevendedor) {

                    should.exist(usuarioRevendedor);
                    done();
                })
                .catch(function(err) {
                    done(err);
                });
        });

        it('recusa credencial invalida', function(done) {
            UsuarioRevendedor.autorizado(
                loginAutorizado,
                senhaAutorizado + '0')
                .then(function() {
                    done('Nao deve aceitar senha errada');
                })
                .catch(function(err) {
                    should.exist(err);
                      err.should.be.an.instanceof(BusinessException);
                    err.should.have.property(
                        'message',
                        'UsuarioRevendedor: senha incorreta');
                    done();
                });
        });

        it('recusa login invalido', function(done) {

            UsuarioRevendedor.autorizado(
                loginAutorizado + '0',
                senhaAutorizado)
                .then(function() {
                    done('Nao deve aceitar login errado');
                })
                .catch(function(err) {
                    should.exist(err);
                    err.should.be.an.instanceof(BusinessException);
                    err.should.have.property(
                        'message',
                        'UsuarioRevendedor: login invalido');
                    done();
                });
        });

    });

    describe('desativar()', function() {


        it('falha para usuario revendedor inexistente', function(done) {
            UsuarioRevendedor
                .desativar({
                     pessoa_fisica_pessoa_id: 0
                })
                .then(function() {
                    done();
                })
                .catch(function(e) {
                    should.exist(e);
                    done();
                });
        });

        it('desativa usuario revendedor existente', function(done) {
            UsuarioRevendedor
                .desativar({
                    pessoa_fisica_pessoa_id: idUsuarioRevendedor 
                })
                .then(function() {
                    done();
                })
                .catch(function(e) {
                    done(e);
                });
        });
    });

    after(function(done) {
        apagarDadosDeTeste()
            .then(function() {
                done();
            })
            .catch(function(e) {
                done(e);
            });
    });
});