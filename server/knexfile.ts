import path from 'path';

module.exports = {
    client: 'mysql',
    connection: {
        host : 'mysql.ecoswim.com.br',
        user : 'ecoswim02',
        password : 'wetrats02',
        database : 'ecoswim02'
    },
    migrations: {
        directory: path.resolve(__dirname, 'src', 'database', 'migrations')
    },
    seeds: {
        directory: path.resolve(__dirname, 'src', 'database', 'seeds')
    }
};