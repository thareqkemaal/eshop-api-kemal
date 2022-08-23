const mysql = require('mysql');
const util = require('util');

// const util berfungsi untuk membuat api bisa menggunakan async await

// create connection, sekali buka api dan mysql, koneksinya akan terus terbuka
// create pool = koneksi api dan mysql nya akan terbuka ketika ada request ke mysql saja
const dbConf = mysql.createPool({
    host: process.env.DB_HOST,
    //port: 3306, // kalau portnya sudah pasti 3306, tidak perlu ditambahkan port
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const dbQuery = util.promisify(dbConf.query).bind(dbConf);

module.exports = { dbConf, dbQuery }