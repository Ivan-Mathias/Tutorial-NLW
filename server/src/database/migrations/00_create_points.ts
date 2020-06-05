import Knex from 'knex';

export async function up(knex: Knex){
    //CRIAR A TABELA
    return knex.schema.createTable('pontos', table => {
        table.increments('id').primary();
        table.string('imagem').notNullable();
        table.string('nome').notNullable();
        table.string('email').notNullable();
        table.string('whatsapp').notNullable();
        table.specificType('latitude', 'double').notNullable();
        table.specificType('longitude', 'double').notNullable();
        table.string('uf', 2).notNullable();
        table.string('cidade').notNullable();
    });
}

export async function down(knex: Knex){
    //VOLTAR ATRAS (DELETAR A TABELA)
    return knex.schema.dropTable('pontos')
}