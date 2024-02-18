const { createPool } = require('mysql2/promise');

const pool  = createPool({
    host: 'bz9xajxapnmjwep9bbyl-mysql.services.clever-cloud.com',
    user: 'ufpvmsro9ya6xmjz',
    password: 'IvGaTnNTsGMzt0WCYthH',
    port: 3306,
    database: 'bz9xajxapnmjwep9bbyl'
});

module.exports = pool;
