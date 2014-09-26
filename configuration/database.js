var Bookshelf = require('bookshelf');
Bookshelf.conexaoMain = Bookshelf.initialize({
    client: 'pg',
    connection: '/var/run/postgresql areaazul'
});
var bspg = Bookshelf.conexaoMain;

bspg.knex.schema.hasTable('estado').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('estado', function(table) {
            table.increments('id_estado').primary();
            table.string('nome').notNullable();
            table.string('uf').notNullable();
            table.boolean('ativo').notNullable();
        }).then(function() {
            console.log('tabela estado criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('cidade').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('cidade', function(table) {
            table.increments('id_cidade').primary();
            table.string('nome').notNullable();
             table.boolean('ativo').notNullable();
            table.bigInteger('estado_id').notNullable().references('id_estado').inTable('estado');
        }).then(function() {
            console.log('tabela cidade criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
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
            console.log('tabela bairro criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
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
            console.log('tabela endereco criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
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
            console.log('tabela pessoa criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('usuario').then(function(exists) {
    if (!exists) {
        bspg.knex.schema
            .createTable('usuario', function(table) {
                table.increments('id_usuario');
                table.string('login').notNullable();
                table.string('senha');
                table.integer('autorizacao').notNullable();
                table.boolean('primeiro_acesso').notNullable();
                table.boolean('ativo').notNullable();
                table.bigInteger('pessoa_id').references('id_pessoa').inTable('pessoa');
            }).then(function() {
                console.log('tabela usuarios criada')
            }).
        catch(function(err) {
            console.log('erro: ' + err)
        });
    }
});


bspg.knex.schema.hasTable('usuario_has_veiculo').then(function(exists) {
    if (!exists) {
        bspg.knex.schema
            .createTable('usuario_has_veiculo', function(table) {
                table.increments('id_usuario_has_veiculo');
                table.bigInteger('usuario_id').references('id_usuario').inTable('usuario');
                table.bigInteger('veiculo_id').references('id_veiculo').inTable('veiculo');
            }).then(function() {
                console.log('tabela usuario_has_veiculo criada')
            }).
        catch(function(err) {
            console.log('erro: ' + err)
        });
    }
});



bspg.knex.schema.hasTable('pessoa_fisica').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('pessoa_fisica', function(table) {
            table.increments('id_pessoa_fisica');
            table.string('cpf').notNullable();
            table.date('data_nascimento');
            table.string('sexo');
            table.boolean('ativo').notNullable();
            table.bigInteger('pessoa_id').references('id_pessoa').inTable('pessoa');
        }).then(function() {
            console.log('tabela pessoa_fisica criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('pessoa_juridica').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('pessoa_juridica', function(table) {
            table.increments('id_pessoa_juridica').primary();
            table.string('cnpj').notNullable();
            table.string('nome_fantasia').notNullable();
            table.string('razao_social').notNullable();
            table.string('incricao_estadual')
            table.string('contato').notNullable();
            table.string('ramo_atividade');
            table.boolean('ativo').notNullable();
            table.bigInteger('pessoa_id').references('id_pessoa').inTable('pessoa');
        }).then(function() {
            console.log('tabela pessoa_juridica criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
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
                console.log('tabela revendedor criada')
            }).
        catch(function(err) {
            console.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('credenciado').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('credenciado', function(table) {
            table.increments('id_credenciado').primary();
            table.boolean('contrato_de_servico_valido').notNullable();
            table.boolean('inadiplente').notNullable();
            table.boolean('ativo').notNullable();
            table.bigInteger('pessoa_id').references('id_pessoa').inTable('pessoa');
        }).then(function() {
            console.log('tabela credenciado criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
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
            console.log('tabela funcionario criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
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
            console.log('tabela fiscal criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('veiculo').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('veiculo', function(table) {
            table.increments('id_veiculo').primary();
            table.string('placa').notNullable();;
            table.bigInteger('placa_numero').notNullable();
            table.string('marca').notNullable();
            table.string('modelo').notNullable();
            table.string('cor').notNullable();
            table.bigInteger('ano_fabricado').notNullable();
            table.bigInteger('ano_modelo').notNullable();
            table.boolean('ativo').notNullable();
            table.bigInteger('estado_id').notNullable().references('id_estado').inTable('estado');
        }).then(function() {
            console.log('tabela veiculo criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('contrato').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('contrato', function(table) {
            table.increments('id_contrato').primary();
            table.bigInteger('numero').notNullable();
            table.date('data_inicio').notNullable;
            table.date('data_termino');
            table.boolean('ativo').notNullable();
            table.bigInteger('pessoa_id').notNullable().references('id_pessoa').inTable('pessoa');
        }).then(function() {
            console.log('tabela contrato criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('configuracao').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('configuracao', function(table) {
            table.increments('id_configuracao').primary();
            table.bigInteger('tempo_limite_estacionamento').notNullable();
            table.bigInteger('tempo_maximo');
            table.bigInteger('tempo_vencimento');
            table.decimal('valor_unitario');
            table.decimal('comissao_credenciado');
            table.decimal('comissao_revendedor');
            table.boolean('ativo').notNullable();
        }).then(function() {
            console.log('tabela configuracao criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('conta').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('conta', function(table) {
            table.increments('id_conta').primary();
            table.date('data_abertura').notNullable();
            table.date('data_fechamento');
            table.decimal('saldo').notNullable();
            table.boolean('ativo').notNullable();
            table.bigInteger('pessoa_id').notNullable().references('id_pessoa').inTable('pessoa');
        }).then(function() {
            console.log('tabela configuracao criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('movimentacao_conta').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('movimentacao_conta', function(table) {
            table.increments('id_movimentacao_conta').primary();
            table.date('data_deposito').notNullable();
            table.date('data_estorno');
            table.string('tipo').notNullable();
            table.decimal('valor').notNullable();
            table.boolean('ativo').notNullable();
            table.bigInteger('conta_id').notNullable().references('id_conta').inTable('conta');
            table.bigInteger('pessoa_id').notNullable().references('id_pessoa').inTable('pessoa');
        }).then(function() {
            console.log('tabela configuracao criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('consumo').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('consumo', function(table) {
            table.increments('id_consumo').primary();
            table.date('data_ativacao').notNullable();
            table.date('data_desativacao');
            table.decimal('valor').notNullable();
            table.boolean('ativo').notNullable();
            table.bigInteger('veiculo_id').notNullable().references('id_veiculo').inTable('veiculo');
            table.bigInteger('pessoa_id').notNullable().references('id_pessoa').inTable('pessoa');
        }).then(function() {
            console.log('tabela consumo criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
        });
    }
});