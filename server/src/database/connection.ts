import knex from 'knex';

const connection = knex({
    client: 'mysql',
    connection: {
        host : 'mysql.ecoswim.com.br',
        user : 'ecoswim02',
        password : 'wetrats02',
        database : 'ecoswim02'
    }
})

export default connection;