var Bookshelf = require('bookshelf');
Bookshelf.conexaoMain = Bookshelf.initialize({
    client: 'pg',
    connection: '/var/run/postgresql areaazul'
});
var bspg = Bookshelf.conexaoMain;

bspg.knex.schema.hasTable('estado').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('estado', function(table) {
            table.increments('id').primary();
            table.string('nome').notNullable();
            table.string('uf').notNullable();
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
            table.increments('id').primary();
            table.string('nome').notNullable();
            table.bigInteger('estado_id').notNullable().references('id').inTable('estado');
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
            table.increments('id').primary();
            table.string('nome').notNullable();
            table.bigInteger('cidade_id').notNullable().references('id').inTable('cidade');
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
            table.increments('id').primary();
            table.string('cep').notNullable();
            table.string('complemento');
            table.string('lote');
            table.string('numero');
            table.string('quadra');
            table.string('logradouro').notNullable();
            table.bigInteger('cidade_id').notNullable().references('id').inTable('cidade');
            table.bigInteger('bairro_id').notNullable().references('id').inTable('bairro');
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
            table.increments('id').primary();
            table.string('nome').notNullable();
            table.string('email').notNullable();
            table.string('telefone');
            table.string('observacao');
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
                table.increments('id');
                table.string('login').notNullable();
                table.string('senha').notNullable();
                table.integer('autorizacao').notNullable();
                table.integer('primeiro_acesso').notNullable();
                table.bigInteger('pessoa_id').references('id').inTable('pessoa');
            }).then(function() {
                console.log('tabela usuarios criada')
            }).
        catch(function(err) {
            console.log('erro: ' + err)
        });
    }
});

bspg.knex.schema.hasTable('pessoa_fisica').then(function(exists) {
    if (!exists) {
        bspg.knex.schema.createTable('pessoa_fisica', function(table) {
            table.increments('id');
            table.string('cpf').notNullable();
            table.date('data_nascimento').notNullable();
            table.string('sexo');
            table.bigInteger('pessoa_id').references('id').inTable('pessoa');
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
            table.increments('id').primary();
            table.string('cnpj').notNullable();
            table.string('nome_fantasia').notNullable();
            table.string('razao_social').notNullable();
            table.string('incricao_estadual').notNullable();
            table.string('contato').notNullable();
            table.string('ramo_atividade').notNullable();
            table.bigInteger('pessoa_id').references('id').inTable('pessoa');
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
                table.increments('id').primary();
                table.bigInteger('pessoa_id').references('id').inTable('pessoa');
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
            table.increments('id').primary();
            table.boolean('contrato_de_servico_valido').notNullable();
            table.boolean('inadiplente').notNullable();
            table.bigInteger('pessoa_id').references('id').inTable('pessoa');
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
            table.increments('id').primary();
            table.bigInteger('empregador_id').notNullable();
            table.bigInteger('pessoa_id').references('id').inTable('pessoa');
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
            table.increments('id').primary();
            table.bigInteger('pessoa_id').references('id').inTable('pessoa');
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
            table.increments('id').primary();
            table.string('cep').notNullable();
            table.string('placa').notNullable();;
            table.bigInteger('placa_numero').notNullable();
            table.string('marca').notNullable();
            table.string('modelo').notNullable();
            table.string('ano_fabricado').notNullable();
            table.string('ano_modelo').notNullable();
            table.bigInteger('estado_id').notNullable().references('id').inTable('estado');
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
            table.increments('id').primary();
            table.bigInteger('numero').notNullable();
            table.date('data_inicio').notNullable;
            table.date('data_termino');
            table.bigInteger('pessoa_id').notNullable().references('id').inTable('pessoa');
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
            table.increments('id').primary();
            table.bigInteger('tempo_limite_estacionamento').notNullable();
            table.bigInteger('tempo_maximo');
            table.bigInteger('tempo_vencimento');
            table.decimal('valor_unitario');
            table.decimal('comissao_credenciado');
            table.decimal('comissao_revendedor');
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
            table.increments('id').primary();
            table.date('data_abertura').notNullable();
            table.date('data_fechamento');
            table.decimal('saldo').notNullable();
            table.bigInteger('pessoa_id').notNullable().references('id').inTable('pessoa');
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
            table.increments('id').primary();
            table.date('data_deposito').notNullable();
            table.date('data_estorno');
            table.string('tipo').notNullable();
            table.decimal('valor').notNullable();
            table.bigInteger('conta_id').notNullable().references('id').inTable('conta');
            table.bigInteger('pessoa_id').notNullable().references('id').inTable('pessoa');
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
            table.increments('id').primary();
            table.date('data_ativacao').notNullable();
            table.date('data_desativacao');
            table.decimal('valor').notNullable();
            table.bigInteger('veiculo_id').notNullable().references('id').inTable('veiculo');
            table.bigInteger('pessoa_id').notNullable().references('id').inTable('pessoa');
        }).then(function() {
            console.log('tabela consumo criada')
        }).
        catch(function(err) {
            console.log('erro: ' + err)
        });
    }
});