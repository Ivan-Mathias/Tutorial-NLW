import Knex from 'knex';

export async function up(knex: Knex){
    //CRIAR A TABELA
    return knex.schema.createTable('pontos_itens', table => {
        table.increments('id').primary();
        table.integer('id_ponto', 11).unsigned().notNullable().references('id').inTable('pontos');
        table.integer('id_item', 11).unsigned().notNullable().references('id').inTable('itens');
    });
}

export async function down(knex: Knex){
    //VOLTAR ATRAS (DELETAR A TABELA)
    return knex.schema.dropTable('pontos_itens')
}