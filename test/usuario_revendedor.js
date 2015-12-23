'use strict';

var should = require('chai').should();
var TestHelpers = require('../helpers/test');
var AreaAzul = require('../areaazul');
var BusinessException = AreaAzul.BusinessException;
var UsuarioRevendedor = AreaAzul.models.UsuarioRevendedor;
var UsuarioRevendedorCollection = AreaAzul.collections.UsuarioRevendedor;
var PessoaFisica = AreaAzul.models.pessoafisica.PessoaFisica;


describe('models.UsuarioRevendedor', function() {
    var cpfNaoExistente = '58316661667';
    var senhaRevendaNaoExistente = 'senha-revenda';
    var loginRevendaNaoExistente = 'revenda-teste';
    var idUsuarioRevendedor = null;
    var idRevendedor = null;
    var termo_servico = true;

    before(function(done) {
          return TestHelpers
            .apagarUsuarioRevendaPorLogin(loginRevendaNaoExistente)
            .then(function() { 
                return TestHelpers.apagarPessoaFisicaPorCPF(cpfNaoExistente); 
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
                login: loginRevendaNaoExistente,
                nome: 'Revenda Teste',
                autorizacao: 'funcionario',
                senha: senhaRevendaNaoExistente,
                email: 'revenda@teste.com',
                cpf: cpfNaoExistente,
                revendedor_id: idRevendedor,
                termo_servico: termo_servico,
            })
            .then(function(usuarioRevendedor) {
                should.exist(usuarioRevendedor);
                idRevendedor = usuarioRevendedor.get('idRevendedor');
                // Salvar id para testes de buscarPorId()
                idUsuarioRevendedor = usuarioRevendedor.id;
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
                login: loginRevendaNaoExistente,
                nome: 'Revenda Teste',
                autorizacao: 'funcionario',
                senha: senhaRevendaNaoExistente,
                email: 'revenda_alterada@teste.com',
                cpf: cpfNaoExistente,
                revendedor_id: idRevendedor,
                termo_servico: termo_servico,
            })
            .then(function(pessoa) {
                should.exist(pessoa);
                done();
            })
            .catch(function(e) {
                done(e);
            });
        });
    });

    describe('listarUsuarioRevenda()', function() {

        it('lista usuario da revenda mantidos no banco de dados', function(done) {
            UsuarioRevendedorCollection.listarUsuarioRevenda(idRevendedor,
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
                loginRevendaNaoExistente,
                senhaRevendaNaoExistente)
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
                loginRevendaNaoExistente,
                senhaRevendaNaoExistente + '0')
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
                loginRevendaNaoExistente + '0',
                senhaRevendaNaoExistente)
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

});
