var Bookshelf = require('bookshelf');
var util = require('../models/models/util');

Bookshelf.conexaoMain = Bookshelf.initialize({
    client: 'pg',
    connection: '/var/run/postgresql areaazul'
});
var bspg = Bookshelf.conexaoMain;

bspg.knex.schema.hasTable('estado').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('estado', function(table) {
            table.increments('id_estado').primary();
            table.string('nome').unique().notNullable();
            table.string('uf').unique().notNullable();
            table.boolean('ativo').notNullable();
        }).then(function() {
            util.log('tabela estado criada')
        }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('cidade').then(function(exists){ 
    if (!exists) {
        bspg.knex.schema.createTable('cidade', function(table) {
            table.increments('id_cidade').primary();
            table.string('nome').notNullable();
             table.boolean('ativo').notNullable();
            table.bigInteger('estado_id').notNullable().references('id_estado').inTable('estado');
        }).then(function() {
            util.log('tabela cidade criada')
        }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('bairro').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('bairro', function(table) {
            table.increments('id_bairro').primary();
            table.string('nome').notNullable();
            table.boolean('ativo').notNullable();
            table.bigInteger('cidade_id').notNullable().references('id_cidade').inTable('cidade');
        }).then(function() {
            util.log('tabela bairro criada')
        }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('endereco').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('endereco', function(table) {
            table.increments('id_endereco').primary();
            table.string('cep').notNullable();
            table.string('complemento');
            table.string('lote');
            table.string('numero');
            table.string('quadra');
            table.string('logradouro').notNullable();
            table.boolean('ativo').notNullable();
            table.bigInteger('cidade_id').notNullable().references('id_cidade').inTable('cidade');
            table.bigInteger('bairro_id').notNullable().references('id_bairro').inTable('bairro');
        }).then(function() {
            util.log('tabela endereco criada')
        }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('pessoa').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('pessoa', function(table) {
            table.increments('id_pessoa').primary();
            table.string('nome').notNullable();
            table.string('email').notNullable();
            table.string('telefone');
            table.string('observacao');
            table.boolean('ativo').notNullable();
        }).then(function() {
            util.log('tabela pessoa criada')
        }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('usuario').then(function(exists) {
    if (!exists) {
        bspg.knex.schema
            .createTable('usuario', function(table) {
                table.increments('id_usuario').primary();
                table.string('login').unique().notNullable();
                table.string('senha');
                table.integer('autorizacao').notNullable();
                table.boolean('primeiro_acesso').notNullable();
                table.boolean('ativo').notNullable();
                table.bigInteger('pessoa_id').references('id_pessoa').inTable('pessoa');
            }).then(function() {
                util.log('tabela usuarios criada')
            }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});


bspg.knex.schema.hasTable('usuario_has_veiculo').then(function(exists) {
    if (!exists) {
        bspg.knex.schema
            .createTable('usuario_has_veiculo', function(table) {
                table.primary(['usuario_id','veiculo_id']);
                table.bigInteger('usuario_id').references('id_usuario').inTable('usuario');
                table.bigInteger('veiculo_id').references('id_veiculo').inTable('veiculo');
            }).then(function() {
                util.log('tabela usuario_has_veiculo criada')
            }).
        catch(function(err) {
            util.log('Erro tabela usuario_has_veiculo: ' + err)
        });
    }
});



bspg.knex.schema.hasTable('pessoa_fisica').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('pessoa_fisica', function(table) {
            table.increments('id_pessoa_fisica').primary();
            table.string('cpf').unique().notNullable();
            table.date('data_nascimento');
            table.string('sexo');
            table.boolean('ativo').notNullable();
            table.bigInteger('pessoa_id').references('id_pessoa').inTable('pessoa');
        }).then(function() {
            util.log('tabela pessoa_fisica criada')
        }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('pessoa_juridica').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('pessoa_juridica', function(table) {
            table.increments('id_pessoa_juridica').primary();
            table.string('cnpj').unique().notNullable();
            table.string('nome_fantasia').notNullable();
            table.string('razao_social').notNullable();
            table.string('incricao_estadual')
            table.string('contato').notNullable();
            table.string('ramo_atividade');
            table.boolean('ativo').notNullable();
            table.bigInteger('pessoa_id').references('id_pessoa').inTable('pessoa');
        }).then(function() {
            util.log('tabela pessoa_juridica criada')
        }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('revendedor').then(function(exists) {
    if (!exists) {
        bspg.knex.schema
            .createTable('revendedor', function(table) {
                table.increments('id_revendedor').primary();
                table.boolean('ativo').notNullable();
                table.bigInteger('pessoa_id').references('id_pessoa').inTable('pessoa');
            }).then(function() {
                util.log('tabela revendedor criada')
            }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('credenciado').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('credenciado', function(table) {
            table.increments('id_credenciado').primary();
            table.boolean('contrato_de_servico_valido');
            table.boolean('inadiplente');
            table.boolean('ativo').notNullable();
            table.bigInteger('pessoa_id').references('id_pessoa').inTable('pessoa');
        }).then(function() {
            util.log('tabela credenciado criada')
        }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('funcionario').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('funcionario', function(table) {
            table.increments('id_funcionario').primary();
            table.boolean('ativo').notNullable();
            table.bigInteger('empregador_id').notNullable();
            table.bigInteger('pessoa_id').references('id_pessoa').inTable('pessoa');
        }).then(function() {
            util.log('tabela funcionario criada')
        }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('fiscal').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('fiscal', function(table) {
            table.increments('id_fiscal').primary();
            table.boolean('ativo').notNullable();
            table.bigInteger('pessoa_id').references('id_pessoa').inTable('pessoa');
        }).then(function() {
            util.log('tabela fiscal criada')
        }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('veiculo').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('veiculo', function(table) {
            table.increments('id_veiculo').primary();
            table.string('placa').unique().notNullable();
            table.string('marca');
            table.string('modelo');
            table.string('cor');
            table.bigInteger('ano_fabricado');
            table.bigInteger('ano_modelo');
            table.boolean('ativo');
            table.bigInteger('estado_id').references('id_estado').inTable('estado');
        }).then(function() {
            util.log('tabela veiculo criada')
        }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('fiscalizacao').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('fiscalizacao', function(table) {
            table.increments('id_fiscalizacao').primary();
            table.string('placa').notNullable();
            table.bigInteger('veiculo_id').nullable()
                .references('id_veiculo').inTable('veiculo');
            table.timestamp('timestamp').notNullable();
            table.bigInteger('fiscal_id').notNullable()
                .references('id_fiscal').inTable('fiscal');
            table.decimal('latitude',14,10);
            table.decimal('longitude',14,10);
            table.decimal('altitude');
        }).then(function() {
            util.log('tabela fiscalizacao criada');
        }).catch(function(err) {
            util.log('erro: ' + err);
        });
    }
});

bspg.knex.schema.hasTable('contrato').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('contrato', function(table) {
            table.increments('id_contrato').primary();
            table.bigInteger('numero').notNullable();
            table.timestamp('data_inicio').notNullable;
            table.timestamp('data_termino');
            table.boolean('ativo').notNullable();
            table.bigInteger('pessoa_id').notNullable().references('id_pessoa').inTable('pessoa');
        }).then(function() {
            util.log('tabela contrato criada')
        }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('configuracao').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('configuracao', function(table) {
            table.increments('id_configuracao').primary();
            table.bigInteger('tempo_limite_estacionamento').notNullable();
            table.bigInteger('tempo_maximo');
            table.bigInteger('tempo_tolerancia');
            table.decimal('valor_unitario');
            table.decimal('comissao_credenciado');
            table.decimal('comissao_revendedor');
            table.boolean('ativo').notNullable();
        }).then(function() {
            util.log('tabela configuracao criada')
        }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});


bspg.knex.schema.hasTable('conta').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('conta', function(table) {
            table.increments('id_conta').primary();
            table.timestamp('data_abertura').notNullable();
            table.timestamp('data_fechamento');
            table.decimal('saldo').notNullable();
            table.boolean('ativo').notNullable();
            table.bigInteger('pessoa_id').notNullable().references('id_pessoa').inTable('pessoa');
        }).then(function() {
            util.log('tabela conta criada')
        }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('movimentacao_conta').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('movimentacao_conta', function(table) {
            table.increments('id_movimentacao_conta').primary();
            table.timestamp('data_deposito').notNullable();
            table.timestamp('data_estorno');
            table.string('historico').notNullable();
            table.string('tipo').notNullable();
            table.decimal('valor').notNullable();
            table.boolean('ativo').notNullable();
            table.bigInteger('conta_id').notNullable().references('id_conta').inTable('conta');
            table.bigInteger('pessoa_id').notNullable().references('id_pessoa').inTable('pessoa');
        }).then(function() {
            util.log('tabela movimentacao_conta criada')
        }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('consumo').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('consumo', function(table) {
            table.increments('id_consumo').primary();
            table.timestamp('data_ativacao').notNullable();
            table.timestamp('data_desativacao');
            table.decimal('valor').notNullable();
            table.boolean('ativo').notNullable();
            table.bigInteger('veiculo_id').notNullable().references('id_veiculo').inTable('veiculo');
            table.bigInteger('pessoa_id').notNullable().references('id_pessoa').inTable('pessoa');
        }).then(function() {
            util.log('tabela consumo criada')
        }).
        catch(function(err) {
            util.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('ativacao').then(function(exists){
    if(!exists){
        bspg.knex.schema.createTable('ativacao', function(table){
            table.increments('id_ativacao').primary();
            table.timestamp('data_ativacao').notNullable();
            table.decimal('latitude');
            table.decimal('longitude');
            table.decimal('altitude');
            table.boolean('ativo').notNullable();
            table.bigInteger('usuario_id').notNullable().references('id_usuario').inTable('usuario');
            table.bigInteger('veiculo_id').notNullable().references('id_veiculo').inTable('veiculo');
        }).then(function(){
            util.log('tabela ativação criada')
        }).catch(function(err){
            util.log('erro: ' + erro)
        });
    }
});
